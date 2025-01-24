import { feature, trigger, workflow } from '@january/declarative';
import { safeFail } from '@workspace/extensions/user';
export default feature({
  workflows: [
    workflow('WatchAccessLog', {
      tag: 'why',
      trigger: trigger.watchFile({
        filePath: './logs/access.jsonl',
        autoRestart: true,
      }),
      execute: async (stream) => {
        for await (const line of stream) {
          console.log(safeFail(() => JSON.parse(line), null));
        }
      },
    }),
  ],
});
