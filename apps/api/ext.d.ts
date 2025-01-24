import { Readable } from 'node:stream';
import { TriggerDefinition } from '@january/declarative';

declare module '@january/declarative' {
  interface Config {
    filePath: string;
    autoRestart?: boolean;
  }
  export namespace trigger {
    interface HttpTrigger<M> {}

    function watchFile(
      config: Config,
    ): TriggerDefinition<[Readable, AbortController]>;
  }
}
