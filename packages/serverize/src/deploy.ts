import chalk from 'chalk';
import { Command, Option } from 'commander';

import { join } from 'path';
import { runInComposeContext, runInDeployContext } from './lib/deploy-context';
import {
  channelOption,
  cwdOption,
  projectOption,
  releaseOption,
  spinner,
} from './program';

const deployPreviewCommand = new Command('preview')
  .description('Deploy a preview version of the project')
  .usage('[options]')
  .option('-pr, --preview [NAME]', 'Preview deployment name');

const outputOption = new Option(
  '-o, --output-file <outputFile>',
  'Write output to a file',
);

// export const compose = new Command('compose')
//   .option(
//     '-f, --file [composefilepath]',
//     'Name of the compose file (default:"$(pwd)/compose.yml")',
//     'compose.yml',
//   )
//   .addOption(outputOption)
//   .addOption(channelOption)
//   .addOption(cwdOption)
//   .addOption(releaseOption)
//   .addOption(projectOption);

export default new Command('deploy')
  .description(
    'Deploy an application using a Dockerfile or Docker Compose file',
  )
  .option(
    '-f, --file [dockerfilepath]',
    'Path to Dockerfile or Compose file',
    'Dockerfile',
  )
  .addOption(outputOption)
  .addOption(channelOption)
  .addOption(cwdOption)
  .addOption(releaseOption)
  .addOption(projectOption)
  .action(async ({ projectName, cwd, file, channel, release, outputFile }) => {
    if (file.endsWith('.yml') || file.endsWith('.yaml')) {
      spinner.start();
      spinner.info(`Deploying (${chalk.green(projectName)})...`);

      await runInComposeContext({
        projectName,
        dockerignorepath: join(cwd, '.dockerignore'),
        file: join(cwd, file),
        cwd,
        channel,
        release,
        outputFile,
      });
    } else {
      spinner.start();
      spinner.info(`Deploying (${chalk.green(projectName)})...`);

      await runInDeployContext({
        projectName,
        file: join(cwd, file),
        dockerignorepath: join(cwd, '.dockerignore'),
        cwd,
        channel,
        release,
        outputFile,
      });
    }
  });
