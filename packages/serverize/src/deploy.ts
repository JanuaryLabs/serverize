import chalk from 'chalk';
import { Command, Option } from 'commander';

import { runInComposeContext, runInDeployContext } from './lib/deploy-context';
import {
  channelOption,
  cwdOption,
  projectOption,
  releaseOption,
  spinner,
} from './program';
import { join } from 'path';

const deployPreviewCommand = new Command('preview').option(
  '-pr, --preview [NAME]',
  'Preview deployment name',
);

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
  .usage('npx serverize deploy -p <projectName>')
  .option(
    '-f, --file [dockerfilepath]',
    'Name of the Dockerfile or Compose file (default:"$(pwd)/Dockerfile")',
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
