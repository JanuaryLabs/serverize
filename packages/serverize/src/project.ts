import { Command } from 'commander';

import { box } from '@january/console';

import { client } from './lib/api-client';
import { askForProjectName, ensureUser, showError, spinner } from './program';

export async function createProject(name?: string) {
  const user = await ensureUser();
  if (!user) return;

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
  .argument('[name]', 'Name of the project')
  .action(async (name) => {
    await createProject(name);
  });
const list = new Command('list').action(async () => {
  const user = await ensureUser();
  if (!user) return;

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
  .description('Manage your projects')
  .addCommand(create)
  .addCommand(list);
