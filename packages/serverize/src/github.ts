import { Command } from 'commander';

const importCmd = new Command('import').action(() => {
  // create a workflow
  // clone and build locally
});

export default new Command('github').addCommand(importCmd).action(() => {
  //
});
