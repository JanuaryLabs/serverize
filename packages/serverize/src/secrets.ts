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
  .usage('[options] NAME=VALUE NAME=VALUE ...')
  .argument('<secrets...>', 'Secrets in format NAME=VALUE')
  .addOption(projectOption)
  .addOption(channelOption)
  .action(async (secretsList, { project, channel }) => {
    const currentProject = await getCurrentProject(project);
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
  .usage('[options] .env')
  .argument('<envFile>', 'Path to the file with secrets')
  .addOption(projectOption)
  .addOption(channelOption)
  .action(async (file, { project, channel }) => {
    const currentProject = await getCurrentProject(project);
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
  .description('Manage project secrets')
  .addCommand(setCommand)
  .addCommand(setFileCommand);
