import { Command } from 'commander';

import { projectOption } from './program';
import { followLogs } from './view-logs';

export default new Command('logs')
  .usage('npx serverize logs -p <projectName>')
  .addOption(projectOption)
  .action(({ project }) => {
    followLogs(project, false);
  });
