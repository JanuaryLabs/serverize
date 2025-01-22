import { tmpdir } from 'os';
import chalk from 'chalk';
import { Command } from 'commander';

import { join } from 'path';
import { ensureDockerRunning } from 'serverize/docker';
import { exist } from 'serverize/utils';
import { login, register } from './auth';
import { client } from './lib/api-client';
import { initialise } from './lib/auth';
import { runInDeployContext } from './lib/deploy-context';
import {
  detectFramework,
  framework,
  getFrameworkOptions,
  supportedFrameworks,
} from './lib/detect-framework';
import {
  channelOption,
  contextOption,
  createSpinner,
  cwdOption,
  dropdown,
  logger,
  outputOption,
  projectOption,
  releaseOption,
  showError,
} from './program';
import { createProject } from './project';
import { setupFramework } from './setup/setup-framework';

interface ShazamConfig {
  frameworkName?: framework;
  projectName?: string;
  channel: 'dev' | 'preview';
  release: string;
  outputFile: string;
  cwd: string;
  shouldSaveToCwd: boolean;
  file: string;
  useDockerfile: boolean;
  serviceName?: string;
  context: string;
}
async function shazam({
  channel,
  cwd,
  file,
  frameworkName,
  outputFile,
  context,
  projectName,
  release,
  shouldSaveToCwd,
  useDockerfile,
  serviceName,
}: ShazamConfig) {
  const spinner = createSpinner();
  await ensureDockerRunning();
  const user = await initialise();

  let dockerfilepath = join(cwd, file || 'Dockerfile');
  let dockerignorepath = join(cwd, '.dockerignore');
  logger(`CWD: ${cwd}`);

  if (!file) {
    let shouldDetectFramework = true;
    if (await exist(dockerfilepath)) {
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
          if (!frameworkName) {
            spinner.fail('No framework selected');
            process.exit(1);
          }
          frameworkOptions = await getFrameworkOptions(frameworkName, cwd);
        }
        spinner.info(`Framework/Language: ${chalk.blue.bold(frameworkName)}`);
      }
      if (frameworkName === 'nx') {
        spinner.fail(
          'NX cannot be shazamed. run `npx serverize setup` and then `npx serverize -f ./apps/<app-dir>/Dockerfile`',
        );
        process.exit(1);
      }

      const [firstSetup, ...rest] = await setupFramework({
        framework: frameworkName,
        cwd: cwd,
        dest: shouldSaveToCwd ? cwd : join(tmpdir(), crypto.randomUUID()),
        options: frameworkOptions,
      });
      if (rest.length) {
        spinner.fail(`Multiple setups found for ${frameworkName}`);
        process.exit(1);
      }
      dockerfilepath = firstSetup.dockerfile;
      dockerignorepath = firstSetup.dockerignore;
      //   for (const setup of setupResult) {
      //     await shazam({
      //       frameworkName: setup.framework,
      //       channel,
      //       cwd,
      //       file,
      //       outputFile,
      //       projectName,
      //       release,
      //       shouldSaveToCwd,
      //       // shouldSaveToCwd: false, // assume that the user always run setup command before shazam
      //       useDockerfile: true, // default to true if exists till we have a better way to ask the user
      //     });
      //   }
      //   return;
    }
  }

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
    dockerignorepath: dockerignorepath,
    cwd: cwd,
    channel,
    release,
    context,
    outputFile,
  });
}
export default new Command('shazam')
  .description('Detect and deploy a project using a Dockerfile or framework')
  .addOption(contextOption)
  .addOption(outputOption)
  .addOption(cwdOption)
  .addOption(channelOption)
  .addOption(releaseOption)
  .addOption(projectOption)
  .option('--framework [framework]', 'Framework to setup')
  .option('--save', 'Save the setup')
  .option(
    '--use-dockerfile-if-exists',
    'Use existing Dockerfile if found in [cwd]',
    false,
  )
  .option(
    '-f, --file [dockerfilepath]',
    'Name of the Dockerfile or Compose file (default:"$(pwd)/Dockerfile")',
  )
  .action(
    async ({
      framework: frameworkName,
      projectName,
      channel,
      release,
      outputFile,
      cwd,
      save: shouldSaveToCwd,
      file,
      context,
      useDockerfileIfExists,
    }) => {
      await shazam({
        frameworkName,
        projectName,
        channel,
        release,
        outputFile,
        cwd,
        context,
        shouldSaveToCwd,
        file,
        useDockerfile: useDockerfileIfExists,
      });
    },
  );
