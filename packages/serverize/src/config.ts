import { confirm, input, password, select } from '@inquirer/prompts';
import { Command } from 'commander';

const workspace = new Command('workspace').action(async () => {
  const workspaces: { name: string; id: string }[] = [];
  const workspace = await select({
    message: 'Select a workspace',
    loop: true,
    choices: workspaces.map((w) => ({
      name: w.name,
      value: w.id,
    })),
  });
});

export default new Command('config').action(() => {
  //
});
