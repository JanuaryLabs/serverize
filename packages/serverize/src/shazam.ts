import chalk from 'chalk';
import { Command } from 'commander';
import { existsSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { ensureDockerRunning } from 'serverize/docker';

import { login, register } from './auth';
import { client } from './lib/api-client';
import { initialise } from './lib/auth';
import { runInDeployContext } from './lib/deploy-context';
import {
  detectFramework,
  getFrameworkOptions,
  supportedFrameworks,
} from './lib/detect-framework';
import {
  channelOption,
  createSpinner,
  cwdOption,
  dropdown,
  projectOption,
  releaseOption,
  showError,
} from './program';
import { createProject } from './project';
import { setupFramework } from './setup/setup-framework';

export default new Command('shazam')
  .option('-o, --output [file]', 'Write output to a file')
  .addOption(cwdOption)
  .addOption(channelOption)
  .addOption(releaseOption)
  .addOption(projectOption)
  .option('--framework [framework]', 'Framework to setup')
  .option('--save', 'Save the setup')
  .option('--use-dockerfile [useDockerfile]')
  .option(
    '-f, --file [dockerfilepath]',
    'Name of the Dockerfile or Compose file (default:"$(pwd)/Dockerfile")',
    'Dockerfile',
  )
  .action(
    async ({
      framework: frameworkName,
      projectName,
      channel,
      release,
      output: outputFile,
      cwd,
      save: shouldSaveToCwd,
      file,
      useDockerfile,
    }) => {
      const spinner = createSpinner();
      await ensureDockerRunning();

      let dockerfilepath = join(cwd, file);

      let shouldDetectFramework = true;
      if (existsSync(dockerfilepath)) {
        if (useDockerfile) {
          shouldDetectFramework = false;
        } else {
          shouldDetectFramework =
            (await dropdown({
              title:
                'Found a Dockerfile in the project directory. Do you want to use it?',
              choices: [
                {
                  name: 'Yes',
                  value: 'yes',
                },
                {
                  name: frameworkName
                    ? `No, use the selected framework (${chalk.blue(frameworkName)})`
                    : 'Use serverize auto detect framework',
                  value: 'no',
                },
              ],
            })) === 'no';
        }
      }

      if (shouldDetectFramework) {
        let frameworkOptions: Record<string, any> | undefined;
        if (frameworkName) {
          frameworkOptions = await getFrameworkOptions(frameworkName, cwd);
          if (!frameworkOptions) {
            spinner.fail(
              `No default setup found for ${frameworkName}. Please create github issue to add support for this framework`,
            );
            process.exit(1);
          }
        } else {
          const detectResult = await detectFramework(cwd);
          if (detectResult) {
            frameworkName = detectResult?.framework;
            frameworkOptions = detectResult?.options;
          } else {
            frameworkName = await dropdown({
              title: `Couldn't detect the framework. Please select a framework`,
              choices: supportedFrameworks.map((it) => ({
                name: it,
                value: it,
              })),
              loop: false,
            }).catch(() => undefined);
            frameworkOptions = await getFrameworkOptions(frameworkName, cwd);
          }

          spinner.info(`Framework/Language: ${chalk.blue.bold(frameworkName)}`);
        }
        const { dockerfile } = await setupFramework({
          framework: frameworkName,
          cwd: cwd,
          dest: shouldSaveToCwd ? cwd : join(tmpdir(), crypto.randomUUID()),
          options: frameworkOptions,
        });
        dockerfilepath = dockerfile;
      }

      const user = await initialise();
      if (!user) {
        spinner.info(chalk.bold('You need to sign in first'));
        const value = await dropdown({
          title: 'Do you want to sign in or create an account?',
          choices: [
            {
              name: 'Sign in',
              value: 'signin',
            },
            {
              name: 'Create an account',
              value: 'signup',
            },
          ],
        });
        if (value === 'signin') {
          await login();
        } else {
          await register();
        }
      }
      if (!projectName) {
        const [projects, error] = await client.request('GET /projects', {});
        if (error) {
          showError(error);
          process.exit(1);
        }

        projectName = await dropdown({
          title: 'Select a project',
          choices: [
            ...projects.records.map(({ name, id }) => ({ name, value: name })),
            {
              name: 'Create a new project',
              value: 'new',
            },
          ],
        });
        if (projectName === 'new') {
          projectName = await createProject();
        }
      }
      if (!projectName) {
        spinner.fail('No project selected');
        process.exit(1);
      }

      spinner.info(`Deploying (${chalk.green(projectName)})...`);
      await runInDeployContext({
        projectName,
        file: dockerfilepath,
        cwd: cwd,
        channel,
        release,
        outputFile,
      });
    },
  );
