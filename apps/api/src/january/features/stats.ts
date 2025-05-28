export default {
  // WatchAccessLog: workflow({
  //   tag: 'why',
  //   trigger: trigger.watchFile({
  //     filePath: './logs/access.jsonl',
  //     autoRestart: true,
  //   }),
  //   execute: async (stream) => {
  //     for await (const line of stream) {
  //       console.log(safeFail(() => JSON.parse(line), null));
  //     }
  //   },
  // }),
};
