import { join } from 'node:path';
import { feature, trigger, workflow } from '@january/declarative';
export default feature({
  workflows: [
    workflow('WatchAccessLog', {
      tag: 'why',
      trigger: trigger.watchFile({
        filePath: '/var/log/nginx/access.jsonl',
        autoRestart: false,
      }),
      execute: async (stream) => {
        for await (const line of stream) {
          console.log(line);
        }
      },
    }),
  ],
});
