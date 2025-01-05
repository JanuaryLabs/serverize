import { confirm, input } from '@inquirer/prompts';
import chalk from 'chalk';
import { detect } from 'detect-package-manager';
import { mkdir, readFile, readdir } from 'fs/promises';

import {
  detectFramework,
  framework,
  readConfig,
} from '../lib/detect-framework';
import { writeDockerIgnore } from '../lib/file';
import { cli, dropdown, spinner } from '../program';
import { getNodejsVersion, setupNodejs } from './nodejs';
import { setupVite } from './vite';
import { basename, dirname, join } from 'path';
import {
  type AstroOutputMode,
  type NextjsOutputMode,
  type PackageManager,
  angular,
  astrojs,
  bun,
  deno,
  dotnet,
  fastapi,
  nextjs,
  nuxtjs,
  remix,
  streamlit,
} from 'serverize/dockerfile';
import { exist, readJsonFile, readPackageJson } from 'serverize/utils';

export interface SetupFrameworkConfig {
  framework: framework;
  cwd: string;
  src?: string;
  dest?: string;
  options?: {
    [key: string]: any;
    packageManager?: PackageManager;
  };
}

export interface SetupResult {
  dockerfile: string;
  dockerignore: string;
  framework: framework;
  appName?: string;
}

export async function setupFramework(
  options: SetupFrameworkConfig,
): Promise<SetupResult[]> {
  const src = options.src || options.cwd;
  const dest = options.dest || src;
  await mkdir(dest, { recursive: true });
  const dockerfilepath = join(dest, 'Dockerfile');
  const dockerIgnoreDir = (options.options?.dockerignoreDir || dest) as string;
  const setups: SetupResult[] = [];
  switch (options.framework) {
    case 'fastapi':
      {
        let mainFile = options.options?.mainFile;
        if (!mainFile) {
          spinner.warn(
            'Could not detect the main.py file. Please provide the path to the app entrypoint file.',
          );
          mainFile = await input({
            message: 'Entrypoint file (relative to the project root)',
            required: true,
            validate: (it) => it.endsWith('.py') || 'Must be a .py file',
          });
        }
        await fastapi({
          dir: dirname(mainFile),
          mainFile: basename(mainFile),
        }).save(dockerfilepath);
        await writeDockerIgnore(dockerIgnoreDir, fastapi.dockerignore);
        setups.push({
          dockerfile: dockerfilepath,
          dockerignore: join(dockerIgnoreDir, '.dockerignore'),
          framework: 'fastapi',
        });
      }
      break;
    case 'nextjs':
      {
        const configFilePath = (await readdir(src)).find((it) =>
          it.startsWith('next.config.'),
        );
        if (!configFilePath) {
          cli.error(
            `Detected Next.js framework but no next.config.js file found in the current directory.`,
          );
          process.exit(1);
        }
        const config = await readConfig(join(src, configFilePath));
        const outputMode =
          config.output ||
          (await dropdown({
            title: 'Select output mode',
            choices: [
              {
                name: 'Default',
                value: 'default',
              },
              {
                name: 'Standalone',
                value: 'standalone',
              },
              {
                name: 'Export',
                value: 'export',
              },
            ],
          }));
        await nextjs({
          packageManager: await detect({ cwd: src }),
          output: outputMode as NextjsOutputMode,
          distDir: config.distDir,
          nodejsVersion: await getNodejsVersion(src).then((it) => it?.alpine),
        }).save(dockerfilepath);
        await writeDockerIgnore(dockerIgnoreDir, nextjs.dockerignore);
        setups.push({
          dockerfile: dockerfilepath,
          dockerignore: join(dockerIgnoreDir, '.dockerignore'),
          framework: 'nextjs',
        });
      }
      break;
    case 'nuxtjs':
      {
        const configFilePath = (await readdir(src)).find((it) =>
          it.startsWith('nuxt.config.'),
        );
        if (!configFilePath) {
          cli.error(
            `Detected "Nuxt.js" framework but no "nuxt.config" file found in the current directory.`,
          );
          process.exit(1);
        }
        const config = await readConfig(join(src, configFilePath), {
          static: true,
          callers: {
            defineNuxtConfig: (config: any) => {
              return config;
            },
          },
        });
        const outputMode = 'ssr' in config ? 'static' : 'ssr';
        spinner.info(`Output: ${outputMode}`);
        await nuxtjs({
          mode: outputMode,
          packageManager: await detect({ cwd: src }),
        }).save(dockerfilepath);
        await writeDockerIgnore(dockerIgnoreDir, nuxtjs.dockerignore);
        setups.push({
          dockerfile: dockerfilepath,
          dockerignore: join(dockerIgnoreDir, '.dockerignore'),
          framework: 'nuxtjs',
        });
      }
      break;
    case 'astrojs':
      {
        const configFilePath = (await readdir(src)).find((it) =>
          it.startsWith('astro.config.'),
        );
        if (!configFilePath) {
          cli.error(
            `Detected "Astro" framework but no "astro.config" file found in the current directory.`,
          );
          process.exit(1);
        }
        const config = await readConfig(join(src, configFilePath), {
          static: true,
          callers: {
            defineConfig: (config: any) => {
              return config;
            },
          },
        });

        spinner.info(`Output: ${config.output}`);
        await astrojs({
          packageManager: await detect({ cwd: src }),
          mode: config.output as AstroOutputMode,
        }).save(dockerfilepath);
        await writeDockerIgnore(dockerIgnoreDir, astrojs.dockerignore);
        setups.push({
          dockerfile: dockerfilepath,
          dockerignore: join(dockerIgnoreDir, '.dockerignore'),
          framework: 'astrojs',
        });
      }
      break;
    case 'vite':
      {
        await setupVite({
          src: src,
          dest,
          ...options.options,
        });
        setups.push({
          dockerfile: dockerfilepath,
          dockerignore: join(dockerIgnoreDir, '.dockerignore'),
          framework: 'vite',
        });
      }
      break;
    case 'angular':
      {
        const ssr = (await readdir(src)).some((it) => it.endsWith('server.ts'));
        const outputMode = ssr ? 'ssr' : 'spa';
        spinner.info(`Output: ${outputMode}`);
        const distDir = options.options?.distDir as string;
        await angular({
          ...options.options,
          packageManager:
            options.options?.packageManager || (await detect({ cwd: src })),
          mode: outputMode,
          distDir: distDir,
        }).save(dockerfilepath);
        await writeDockerIgnore(dockerIgnoreDir, angular.dockerignore);
        setups.push({
          dockerfile: dockerfilepath,
          dockerignore: join(dockerIgnoreDir, '.dockerignore'),
          framework: 'angular',
        });
      }
      break;
    case 'streamlit': {
      await streamlit().save(dockerfilepath);
      await writeDockerIgnore(dockerIgnoreDir, streamlit.dockerignore);
      break;
    }
    case 'dotnet': {
      const csProjFile = (await readdir(src)).find((it) =>
        it.endsWith('.csproj'),
      );
      if (!csProjFile) {
        cli.error(`Could not find .csproj file in ${src}`);
        process.exit(1);
      }
      const projectName = csProjFile.replace('.csproj', '');
      spinner.info(`Project name: ${projectName}`);
      spinner.warn(
        chalk.gray(
          'Configure health check "https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/health-checks"',
        ),
      );
      const changeHealthCheck = await confirm({
        default: false,
        message:
          'Using /healthz for health check. would you like to change it?',
      });
      let healthCheck = '/healthz';
      if (changeHealthCheck) {
        healthCheck = await input({
          message: 'Enter the new health check',
          default: healthCheck,
        });
      }
      // TODO: pick version from .csproj. needs xml parser
      await dotnet({ projectName, healthCheck, version: '8.0' }).save(
        dockerfilepath,
      );
      await writeDockerIgnore(dockerIgnoreDir, dotnet.dockerignore);
      setups.push({
        dockerfile: dockerfilepath,
        dockerignore: join(dockerIgnoreDir, '.dockerignore'),
        framework: 'dotnet',
      });
      break;
    }
    case 'remix': {
      const configFilePath = (await readdir(src)).find((it) =>
        it.startsWith('vite.config.'),
      );
      if (!configFilePath) {
        cli.error(
          `Detected "Vite" framework but no "vite.config" file found in the current directory.`,
        );
        process.exit(1);
      }
      const config = await readConfig(join(src, configFilePath), {
        static: true,
        callers: {
          defineConfig: (config: any) => {
            return config.plugins.filter(Boolean).find((it: any) => it.remix);
          },
          remix: (config: any) => {
            return { remix: true, mode: config.ssr };
          },
        },
      });
      const outputMode = config?.mode === false ? 'spa' : 'ssr';
      spinner.info(`Output: ${outputMode}`);
      await remix({
        packageManager: await detect({ cwd: src }),
        mode: outputMode,
      }).save(dockerfilepath);
      await writeDockerIgnore(dockerIgnoreDir, remix.dockerignore);
      setups.push({
        dockerfile: dockerfilepath,
        dockerignore: join(dockerIgnoreDir, '.dockerignore'),
        framework: 'remix',
      });
      break;
    }
    case 'deno': {
      await deno().save(dockerfilepath);
      await writeDockerIgnore(dockerIgnoreDir, deno.dockerignore);
      break;
    }
    case 'bun': {
      const { content } = await readPackageJson(src);
      let buildCommand = content.scripts?.build;
      if (!buildCommand) {
        spinner.info('Could not find a build script in package.json');
        buildCommand ??= await input({
          message: 'Build command',
          required: true,
          default: 'bun build ./src/index.ts --outfile index.js',
        });
      }
      const entrypoint = await input({
        message: 'Entrypoint (the --outfile of the "bun build" command)',
        default: './index.js',
      });
      await bun({
        buildCommand: buildCommand,
        entrypoint: entrypoint,
      }).save(dockerfilepath);
      await writeDockerIgnore(dockerIgnoreDir, bun.dockerignore);
      setups.push({
        dockerfile: dockerfilepath,
        dockerignore: join(dockerIgnoreDir, '.dockerignore'),
        framework: 'bun',
      });
      break;
    }
    case 'nodejs': {
      {
        await setupNodejs({
          cwd: options.cwd,
          src: src,
          dest,
          ...options.options,
        });
        setups.push({
          dockerfile: dockerfilepath,
          dockerignore: join(dockerIgnoreDir, '.dockerignore'),
          framework: 'nodejs',
        });
      }
      break;
    }
    case 'nx': {
      const nxJson = JSON.parse(await readFile(join(src, 'nx.json'), 'utf-8'));
      let appsDir = nxJson?.workspaceLayout?.appsDir || 'apps';
      if (!(await exist(join(src, appsDir)))) {
        spinner.warn(`Could not find the apps directory.`);
        appsDir = await input({
          message: 'Apps directory (relative to the project root)',
        });
      }
      const appsNames = (
        await readdir(join(src, appsDir), {
          withFileTypes: true,
        })
      )
        .filter((it) => it.isDirectory() && !it.name.endsWith('e2e'))
        .map((it) => it.name);
      const appsConfigs: {
        src: string;
        dest: string;
        name: string;
        config: Record<string, any>;
      }[] = [];
      for (const app of appsNames) {
        const appSrc = join(src, appsDir, app);
        const projectJson = await readJsonFile(join(appSrc, 'project.json'));
        if (!projectJson) {
          continue;
        }
        appsConfigs.push({
          name: app,
          config: projectJson,
          src: appSrc,
          dest: join(dest, appsDir, app),
        });
      }
      spinner.info(
        `Projects: ${chalk.blue(appsConfigs.map((it) => it.name).join(','))}`,
      );
      for (const appConfig of appsConfigs) {
        const frameworkDetails = await detectFramework(appConfig.src, {
          nx: true,
        });
        if (!frameworkDetails) {
          spinner.fail(
            `Could not detect the framework for project ${chalk.bgBlue(
              appConfig.name,
            )}`,
          );
          continue;
        }
        const { framework, options: frameworkOptions } = frameworkDetails;

        spinner.info(
          `Project: ${chalk.bgBlue(appConfig.name)}, Framework: ${chalk.bgYellow(framework)}`,
        );

        const nxAppSetupResult = await setupFramework({
          framework,
          cwd: src,
          src: appConfig.src,
          dest: appConfig.dest,
          options: {
            packageManager: await detect({ cwd: src }),
            dockerignoreDir: dest,
            buildCommand: `./node_modules/.bin/nx run ${appConfig.name}:build`,
            distDir: `./dist/apps/${appConfig.name}`,
            ...frameworkOptions,
          },
        });
        setups.push(...nxAppSetupResult);
      }
      break;
    }
    default:
      if (!setups.length) {
        throw new Error(`Unknown framework ${options.framework}`);
      }
  }
  return setups;
}
