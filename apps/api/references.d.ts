/// <reference path="../../node_modules/@januarylabs/extensions/src/identity/index.d.ts" />
/// <reference path="../../node_modules/@januarylabs/extensions/src/hono/index.d.ts" />
/// <reference path="../../node_modules/@januarylabs/extensions/src/firebase/auth/index.d.ts" />
/// <reference path="../../node_modules/@januarylabs/extensions/src/typeorm/index.d.ts" />

import type { Readable } from 'node:stream';
import type { Policy } from '@januarylabs/declarative';
import type { TriggerDefinition } from '@januarylabs/declarative';

declare module '@januarylabs/declarative' {
  export namespace policy {
    function authenticated(): Policy;
  }
  export namespace trigger {
    export interface HttpTrigger<M> {
      // @ts-ignore
      subject: import(
        './src/app/extensions/firebase-auth/subject.ts',
      ).IdentitySubject;
    }
  }
}

declare module '@januarylabs/declarative' {
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
