import chalk from 'chalk';
import { Command } from 'commander';

import { client } from './lib/api-client';
import {
  dropdown,
  ensureUser,
  projectOption,
  showError,
  spinner,
} from './program';

import { box } from '@january/console';

const create = new Command('create')
  .description(
    'Generate a new access token for deploying projects in CI environment',
  )
  .addOption(projectOption.makeOptionMandatory(false))
  .action(async ({ projectName }) => {
    const user = await ensureUser();
    if (!user) return;
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
    let projectId = projects.records.length === 1 ? projects.records[0].id : '';
    if (projectName) {
      const [project] = projects.records.filter(
        (project) => project.name === projectName,
      );
      if (!project) {
        spinner.fail(`Project ${chalk.red(projectName)} not found`);
        return;
      }
      projectId = project.id;
    }
    projectId ||= await dropdown({
      title: 'Select a project',
      choices: projects.records.map(({ name, id }) => ({ name, value: id })),
    });
    const [data, error] = await client.request('POST /tokens', { projectId });
    if (error) {
      showError(error);
      process.exit(1);
    }
    box.print('Save it in secure place', data);
  });

const revoke = new Command('revoke')
  .description('Permanently revoke an access token')
  .argument('<token>', 'Token to revoke')
  .action(async (token) => {
    const user = await ensureUser();
    if (!user) return;
    const [, error] = await client.request('DELETE /tokens', {
      token,
    });
    if (error) {
      showError(error);
      process.exit(1);
    }
  });

const list = new Command('list')
  .alias('ls')
  .description('List all active access tokens')
  .action(async () => {
    const user = await ensureUser();
    if (!user) return;
    const [tokens, error] = await client.request('GET /tokens', {});
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
  .description('Manage deployment access tokens')
  .addCommand(create)
  .addCommand(list)
  .addCommand(revoke);
