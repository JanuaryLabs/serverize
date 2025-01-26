import { Command } from 'commander';

import { client } from './lib/api-client';
import {
  channelOption,
  ensureUser,
  projectOption,
  releaseOption,
  showError,
} from './program';

export default new Command('logs')
  .description('View logs for a specific project and release')
  .addOption(projectOption)
  .addOption(channelOption)
  .addOption(releaseOption)
  .action(async ({ projectName, release, channel }) => {
    const user = await ensureUser();
    if (!user) process.exit();
    const [stream, error] = await client.request('GET /container/logs', {
      projectName: projectName,
      channelName: channel,
      releaseName: release,
    });
    if (error) {
      showError(error);
      process.exit(1);
    }
    const decoder = new TextDecoder();
    for await (const chunk of stream) {
      console.log(decoder.decode(chunk, { stream: true }));
    }
  });
