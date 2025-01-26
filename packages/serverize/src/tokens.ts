import chalk from 'chalk';
import { Command } from 'commander';

import { client } from './lib/api-client';
import {
  dropdown,
  ensureUser,
  projectOption,
  projectOptionsArg,
  showError,
  spinner,
} from './program';

import { box } from '@january/console';

const create = new Command('create')
  .summary('Generate a new token')
  .option(...projectOptionsArg)
  .action(async ({ projectName }) => {
    const user = await ensureUser();
    if (!user) process.exit(1);

    const [data, error] = await client.request('POST /tokens', {
      projectName: projectName || (await selectProject()),
    });
    if (error) {
      showError(error);
      process.exit(1);
    }
    box.print('Save it in secure place', data);
  });

async function selectProject() {
  const [projects = { records: [] }, getProjectsError] = await client.request(
    'GET /projects',
    {},
  );
  if (getProjectsError) {
    showError(getProjectsError);
    process.exit(1);
  }
  if (projects.records.length === 0) {
    box.print(
      'No projects found',
      '$ npx serverize projects create <project-name>',
    );
    return;
  }
  return await dropdown({
    title: 'Select a project',
    choices: projects.records.map(({ name, id }) => ({ name, value: name })),
  });
}

const revoke = new Command('revoke')
  .summary('Permanently revoke an access token')
  .argument('<token>', 'Token to revoke')
  .addOption(projectOption)
  .action(async (token, { projectName }) => {
    const user = await ensureUser();
    if (!user) process.exit();
    const [, error] = await client.request('DELETE /tokens', {
      token,
      projectName,
    });
    if (error) {
      showError(error);
      process.exit(1);
    }
  });

const list = new Command('list')
  .alias('ls')
  .summary('List all active access tokens')
  .addOption(projectOption)
  .action(async ({ projectName }) => {
    const user = await ensureUser();
    if (!user) process.exit();
    const [tokens, error] = await client.request('GET /tokens', {
      projectName: projectName,
    });
    if (error) {
      showError(error);
      process.exit(1);
    }

    if (tokens.length === 0) {
      box.print(
        'No tokens found',
        '$ npx serverize tokens create <project-name>',
      );
      return;
    }
    console.table(
      tokens.map((token) => ({
        Id: token.id,
        Project: token.project.name,
        'Created At': token.createdAt,
      })),
    );
  });

export default new Command('tokens')
  .summary('Manage access tokens for CI/CD')
  .description(
    `Tokens are used to authenticate and authorize deployments in continuous integration environments, allowing secure automated deployments without exposing sensitive credentials.`,
  )
  .addCommand(create)
  .addCommand(list)
  .addCommand(revoke);
