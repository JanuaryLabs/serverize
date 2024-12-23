import { confirm, input } from '@inquirer/prompts';
import chalk from 'chalk';
import { detect } from 'detect-package-manager';
import { mkdir, readFile, readdir } from 'fs/promises';
import { join } from 'path';

import {
  type AstroOutputMode,
  type NextjsOutputMode,
  type PackageManager,
  angular,
  astrojs,
  bun,
  deno,
  dotnet,
  nextjs,
  nuxtjs,
  remix,
  streamlit,
} from 'serverize/dockerfile';
import { readJsonFile, readPackageJson } from 'serverize/utils';

import { detectFramework, readConfig } from '../lib/detect-framework';
import { writeDockerIgnore } from '../lib/file';
import { cli, dropdown, spinner } from '../program';
import { getNodejsVersion, setupNodejs } from './nodejs';
import { setupVite } from './vite';

export interface SetupFrameworkConfig {
  framework: string;
  cwd: string;
  src?: string;
  dest?: string;
  options?: {
    [key: string]: any;
    packageManager?: PackageManager;
  };
}
export async function setupFramework(options: SetupFrameworkConfig) {
  const src = options.src || options.cwd;
  const dest = options.dest || src;
  await mkdir(dest, { recursive: true });
  const dockerfilepath = join(dest, 'Dockerfile');
  const dockerIgnoreDir = (options.options?.dockerignoreDir || dest) as string;
  switch (options.framework) {
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
      }
      break;
    case 'vite':
      await setupVite({
        src: src,
        dest,
        ...options.options,
      });
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
      break;
    }
    case 'nodejs': {
      await setupNodejs({
        cwd: options.cwd,
        src: src,
        dest,
        ...options.options,
      });
      break;
    }
    case 'nx': {
      const nxJson = JSON.parse(await readFile(join(src, 'nx.json'), 'utf-8'));
      const appsDir = nxJson?.workspaceLayout?.appsDir || 'apps';
      const appsNames = (
        await readdir(join(src, appsDir), {
          withFileTypes: true,
        })
      )
        .filter((it) => it.isDirectory() && !it.name.endsWith('e2e'))
        .map((it) => it.name);
      const appsConfigs: {
        dir: string;
        name: string;
        config: Record<string, any>;
      }[] = [];
      for (const app of appsNames) {
        const dir = join(src, appsDir, app);
        const projectJson = await readJsonFile(join(dir, 'project.json'));
        if (!projectJson) {
          continue;
        }
        appsConfigs.push({
          name: app,
          config: projectJson,
          dir,
        });
      }
      spinner.info(
        `Projects: ${chalk.blue(appsConfigs.map((it) => it.name).join(','))}`,
      );
      for (const appConfig of appsConfigs) {
        const frameworkDetails = await detectFramework(appConfig.dir, {
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

        await setupFramework({
          framework,
          cwd: options.cwd,
          src: appConfig.dir,
          dest: appConfig.dir,
          options: {
            packageManager: await detect({ cwd: src }),
            dockerignoreDir: dest,
            buildCommand: `./node_modules/.bin/nx run ${appConfig.name}:build`,
            distDir: `./dist/apps/${appConfig.name}`,
            ...frameworkOptions,
          },
        });
      }
      break;
    }
    default:
      throw new Error(`Unknown framework ${options.framework}`);
  }
  return { dockerfile: dockerfilepath };
}
