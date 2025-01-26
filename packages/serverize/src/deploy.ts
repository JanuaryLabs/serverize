import chalk from 'chalk';
import { Command, Option } from 'commander';

import { join } from 'path';
import { client } from './lib/api-client';
import { runInComposeContext, runInDeployContext } from './lib/deploy-context';
import {
  SERVERIZE_API_TOKEN,
  channelOption,
  contextOption,
  cwdOption,
  getCurrentProject,
  imageOption,
  outputOption,
  projectOption,
  releaseOption,
  spinner,
} from './program';

const deployPreviewCommand = new Command('preview')
  .description('Deploy a preview version of the project')
  .usage('[options]')
  .option('-pr, --preview [NAME]', 'Preview deployment name');

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
    'Path to a Dockerfile relative to --cwd. ignored if --image is present',
    'Dockerfile',
  )
  .addOption(imageOption)
  .addOption(contextOption)
  .addOption(outputOption)
  .addOption(channelOption)
  .addOption(cwdOption)
  .addOption(releaseOption)
  .addOption(projectOption)
  .action(
    async ({
      projectName,
      context,
      cwd,
      file,
      channel,
      release,
      outputFile,
      image,
    }) => {
      if (SERVERIZE_API_TOKEN) {
        client.setOptions({ token: SERVERIZE_API_TOKEN });
      }

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
          context,
        });
      } else {
        spinner.start();
        await runInDeployContext({
          projectName: projectName,
          file: join(cwd, file),
          dockerignorepath: join(cwd, '.dockerignore'),
          cwd,
          image,
          channel,
          release,
          context,
          outputFile,
        });
      }
    },
  );
