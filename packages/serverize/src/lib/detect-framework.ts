import { existsSync } from 'fs';
import { readFile, readdir, rm } from 'fs/promises';

import { parseRequirements } from './requirements-parser';
import { basename, dirname, join } from 'path';
import { exist, getFile, readJsonFile, safeFail } from 'serverize/utils';

import { fileBundler } from '@january/bundler';
import { type Callers, staticEval } from '@january/evaluator';
import { checker, parseCode, resolveCallExpression } from '@january/parser';

export const supportedFrameworks = [
  'nextjs',
  'nuxtjs',
  'astrojs',
  'vite',
  'angular',
  'streamlit',
  'dotnet',
  'remix',
  'nodejs',
  'bun',
  'deno',
  'gh-pr-preview',
  'gh-automate',
  'nx',
  'fastapi',
  // 'jamstack' // check if package.json is there and if so, check if it has a build script, otherwise just use nginx
] as const;

export type framework = (typeof supportedFrameworks)[number];

type Clue = (config: { cwd: string; hints: Record<string, any> }) => unknown;
const frameworksClues: Record<framework, Clue[]> = {
  'gh-pr-preview': [(config) => false],
  'gh-automate': [(config) => false],
  nextjs: [
    (config) => {
      const configFiles = [
        'next.config.js',
        'next.config.mjs',
        'next.config.ts',
        'next.config.cjs',
      ];
      return configFiles.some((it) => existsSync(join(config.cwd, it)));
    },
  ],
  nuxtjs: [
    (config) => {
      const configFiles = [
        'nuxt.config.js',
        'nuxt.config.mjs',
        'nuxt.config.ts',
        'nuxt.config.cjs',
      ];
      return configFiles.some((it) => existsSync(join(config.cwd, it)));
    },
  ],
  astrojs: [
    (config) => {
      const configFiles = [
        'astro.config.js',
        'astro.config.mjs',
        'astro.config.ts',
        'astro.config.cjs',
      ];
      return configFiles.some((it) => existsSync(join(config.cwd, it)));
    },
  ],
  angular: [
    async (config) => {
      if (config.hints.nx) {
        const projectJson = await readJsonFile(
          join(config.cwd, 'project.json'),
        );
        if (!projectJson) {
          return null;
        }
        const buildTarget = projectJson.targets?.build;
        if (!buildTarget) {
          return null;
        }
        const isKnownExecuter = ['@nx/angular:application'].includes(
          buildTarget.executor,
        );
        if (!isKnownExecuter) {
          return null;
        }
        return {
          distDir:
            buildTarget.configurations?.[buildTarget.defaultConfiguration]
              ?.outputPath || buildTarget.options.outputPath,
        };
      }
      const configFiles = ['angular.json'];
      const isAngular = configFiles.some((it) =>
        existsSync(join(config.cwd, it)),
      );
      if (!isAngular) {
        return null;
      }
      const angularJson = await readJsonFile(join(config.cwd, 'angular.json'));
      if (!angularJson) {
        return null;
      }
      return {
        distDir: safeFail(
          () => angularJson.projects.angular.architect.build.options.outputPath,
          'dist/angular',
        ),
      };
    },
  ],
  remix: [
    async (config) => {
      const configFilePath = (await readdir(config.cwd)).find((it) =>
        it.startsWith('vite.config.'),
      );
      if (!configFilePath) {
        return false;
      }
      const hasRemixPlugin = await readConfig(
        join(config.cwd, configFilePath),
        {
          static: true,
          callers: {
            defineConfig: (config: any) => {
              return config.plugins.filter(Boolean).find((it: any) => it.remix);
            },
            remix: (config) => {
              return { remix: true, mode: config.ssr };
            },
          },
        },
      );
      return hasRemixPlugin;
    },
  ],
  vite: [
    (config) => {
      const configFiles = [
        'vite.config.js',
        'vite.config.mjs',
        'vite.config.ts',
        'vite.config.cjs',
      ];
      return configFiles.some((it) => existsSync(join(config.cwd, it)));
    },
  ],
  fastapi: [
    async (config) => {
      const content = await getFile(join(config.cwd, 'requirements.txt'));
      if (!content) return false;
      const requirements = await parseRequirements(content);
      const isFastapi = requirements.some(
        (it) => it.type === 'package' && it.package === 'fastapi',
      );
      if (!isFastapi) return null;
      const mainPy = (await exist(join(config.cwd, 'main.py')))
        ? 'main.py'
        : (await exist(join(config.cwd, 'app', 'main.py')))
          ? join('app', 'main.py')
          : null;
      return {
        mainFile: mainPy,
      };
    },
  ],
  streamlit: [
    async (config) => {
      const content = await getFile(join(config.cwd, 'requirements.txt'));
      if (!content) return false;
      const requirements = await parseRequirements(content);
      const hasStreamlit = requirements.find(
        (it) => it.type === 'package' && it.package === 'streamlit',
      );
      return !!hasStreamlit;
    },
  ],
  dotnet: [
    async (config) => {
      return (await readdir(config.cwd)).some((it) => it.endsWith('.csproj'));
    },
  ],
  nx: [
    async (config) => {
      const configFiles = ['nx.json'];
      return configFiles.some((it) => existsSync(join(config.cwd, it)));
    },
  ],
  deno: [
    async (config) => {
      const configFiles = ['deno.json'];
      return configFiles.some((it) => existsSync(join(config.cwd, it)));
    },
  ],
  bun: [
    async (config) => {
      const configFiles = ['package.json', 'bun.lockb']; // is there a better way to detect bun?
      return configFiles.every((it) => existsSync(join(config.cwd, it)));
    },
  ],
  nodejs: [
    async (config) => {
      if (config.hints.nx) {
        const projectJson = await readJsonFile(
          join(config.cwd, 'project.json'),
        );
        if (!projectJson) {
          return null;
        }
        const buildTarget = projectJson.targets?.build;
        if (!buildTarget) {
          return null;
        }
        switch (buildTarget.executor) {
          case '@nx/webpack:webpack':
            if (buildTarget.options.target !== 'node') {
              return null;
            }
            return {
              entrypoint: join(
                buildTarget.options.outputPath,
                basename(buildTarget.options.main).replace('.ts', '.js'),
              ),
              distDir: buildTarget.options.outputPath,
              bundle: false,
            };
          case '@nx/esbuild:esbuild':
            if (buildTarget.options.platform !== 'node') {
              return null;
            }
            return {
              entrypoint: join(
                buildTarget.options.outputPath,
                basename(buildTarget.options.main).replace('.ts', '.js'),
              ),
              distDir: buildTarget.options.outputPath,
              bundle:
                buildTarget.options.thirdParty && buildTarget.options.bundle,
            };
          default:
            return null;
        }
      }
      const configFiles = [
        'package.json',
        'package-lock.json',
        'package-lock.jsonc',
      ]; // is there a better way to detect bun?
      return configFiles.some((it) => existsSync(join(config.cwd, it)));
    },
  ],
};

export async function detectFramework(
  cwd: string,
  hints: Record<string, any> = {},
) {
  for (const [framework, clues] of Object.entries(frameworksClues)) {
    for (const clue of clues) {
      const options = (await clue({ cwd, hints })) as Record<string, any>;
      if (options) {
        return { framework: framework as framework, options };
      }
    }
  }
  return;
}

export async function getFrameworkOptions(
  name: framework,
  cwd: string,
  hints: Record<string, any> = {},
) {
  const clues = frameworksClues[name];
  for (const clue of clues) {
    const options = await clue({ cwd, hints });
    if (options) {
      return options as Record<string, any>;
    }
  }
  return;
}

export async function parse(code: string) {
  const val = await parseCode(code);
  if (!val) {
    return null;
  }

  const defaultExpr = val.body.find(
    (it) => it.type === 'ExportDefaultExpression',
  );

  if (!defaultExpr) {
    return null;
  }

  if (!checker.isCallExpression(defaultExpr.expression)) {
    return null;
  }

  return resolveCallExpression(defaultExpr.expression, code);
}

export async function dynamicConfig(path: string) {
  if (!path.endsWith('.ts')) {
    return import(path).then((x) => x.default);
  }
  const tempFile = join(dirname(path), `${crypto.randomUUID()}.mjs`);
  try {
    await fileBundler({
      entry: path,
      out: tempFile,
    });
    return import(tempFile).then((x) => x.default);
  } finally {
    await rm(tempFile, { force: true });
  }
}

export async function staticConfig(path: string, callers: Callers) {
  const configContent = await readFile(path, 'utf-8');
  return staticEval(callers, await parse(configContent), {
    unknownCaller: (node, caller) => {
      return null;
    },
  });
}

export async function readConfig(
  path: string,
  config: {
    static?: boolean;
    callers?: Callers;
  } = {},
) {
  return config.static
    ? staticConfig(path, config.callers ?? {})
    : dynamicConfig(path);
}
