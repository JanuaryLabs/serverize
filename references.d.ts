/// <reference path="node_modules/@january/extensions/src/identity/index.d.ts" />
/// <reference path="node_modules/@january/extensions/src/hono/index.d.ts" />
/// <reference path="node_modules/@january/extensions/src/firebase/auth/index.d.ts" />
/// <reference path="node_modules/@january/extensions/src/typeorm/index.d.ts" />

import type { Policy } from '@january/declarative';

declare module '@january/declarative' {
  export namespace policy {
    function authenticated(): Policy;
  }
  export namespace trigger {
    export interface HttpTrigger<M> {
      // @ts-ignore
      subject: import(
        './apps/api/src/app/extensions/firebase-auth/subject.ts',
      ).IdentitySubject;
    }
  }
}
