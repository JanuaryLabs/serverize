import { Command } from 'commander';

import { client } from './lib/api-client';
import { askForProjectName, ensureUser, showError, spinner } from './program';

import { box } from '@january/console';

export async function createProject(name?: string) {
  const user = await ensureUser();
  if (!user) process.exit();

  name ??= await askForProjectName();

  const [, error] = await client.request(`POST /projects`, {
    name,
  });
  if (error) {
    showError(error);
    process.exit(1);
  }
  spinner.succeed(`Project ${name} created`);
  return name;
}

const create = new Command('create')
  .description('Create a new project')
  .argument('[name]', 'Name of the project')
  .action(async (name) => {
    await createProject(name);
  });

const list = new Command('list')
  .alias('ls')
  .description('List all projects')
  .action(async () => {
    const user = await ensureUser();
    if (!user) process.exit();

    const [projects, error] = await client.request('GET /projects', {});
    if (error) {
      showError(error);
      process.exit(1);
    }
    if (projects.records.length === 0) {
      box.print(
        'No projects found',
        'Create a project by running:',
        '$ npx serverize projects create <project-name>',
      );
      return;
    }
    console.table(projects.records, ['id', 'name']);
  });

process.on('unhandledRejection', (error) => {
  showError(error as any);
  process.exit(1);
});

export default new Command('projects')
  .alias('project')
  .alias('p')
  .description(`Manage your serverize projects`)
  .addCommand(create)
  .addCommand(list);
