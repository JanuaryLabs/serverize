import { Command } from 'commander';
import { parse } from 'dotenv';
import { readFile } from 'fs/promises';

import { join } from 'path';
import { client } from './lib/api-client';
import {
  channelOption,
  getCurrentProject,
  projectOption,
  showError,
  spinner,
} from './program';

const setCommand = new Command('set')
  .description('Set one or more environment variables for a project channel')
  .argument('<secrets...>', 'Secrets in format NAME=VALUE')
  .addOption(projectOption)
  .addOption(channelOption)
  .action(async (secretsList, { projectName, channel }) => {
    const currentProject = await getCurrentProject(projectName);
    for (const secret of secretsList) {
      const [name, value] = secret.split('=');
      if (!name && !value) {
        throw new Error(`Secret "${secret}" must be in the format NAME=VALUE`);
      }
      if (name && !value) {
        throw new Error(`Secret ${name} is missing value`);
      }
      const [, error] = await client.request('POST /secrets', {
        projectId: currentProject.projectId,
        channel: channel,
        secretLabel: name,
        secretValue: value,
      });
      if (error) {
        showError(error);
        process.exit(1);
      }
    }
    spinner.succeed('Secrets set successfully');
  });

const setFileCommand = new Command('set-file')
  .description('Import environment variables from a .env file')
  .argument('<envFile>', 'Path to the file with secrets')
  .addOption(projectOption)
  .addOption(channelOption)
  .action(async (file, { projectName, channel }) => {
    const currentProject = await getCurrentProject(projectName);
    const secrets = Object.entries(
      parse(await readFile(join(process.cwd(), file), 'utf-8')),
    );
    for (const [name, value] of secrets) {
      if (!name && !value) {
        throw new Error('Secret must be in the format NAME=VALUE');
      }
      if (name && !value) {
        throw new Error(`Secret ${name} is missing value`);
      }
      const [, error] = await client.request('POST /secrets', {
        channel: channel,
        projectId: currentProject.projectId,
        secretLabel: name,
        secretValue: value,
      });
      if (error) {
        showError(error);
        process.exit(1);
      }
    }
    spinner.succeed('Secrets set successfully');
  });

export default new Command('secrets')
  .summary('Manage project channel secrets')
  .description(
    `Secrets are secure pieces of data you can store and use at runtime, such as API keys, database passwords, or plaintext values. These are made available to your project as environment variables for use as needed.`,
  )
  .addCommand(setCommand)
  .addCommand(setFileCommand);
