import chalk from 'chalk';
import { Command } from 'commander';
import { box } from '@january/console';

import { client } from './lib/api-client';
import {
  dropdown,
  ensureUser,
  projectOption,
  showError,
  spinner,
} from './program';

const create = new Command('create')
  .addOption(projectOption.makeOptionMandatory(false))
  .action(async ({ name }) => {
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
    if (name) {
      const [project] = projects.records.filter(
        (project) => project.name === name,
      );
      if (!project) {
        spinner.fail(`Project ${chalk.red(name)} not found`);
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

const list = new Command('list').alias('ls').action(async () => {
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
      Project: token.project.name,
      'Created At': token.createdAt,
    })),
  );
});

export default new Command('tokens')
  .addCommand(create)
  .addCommand(list)
  .addCommand(revoke);
