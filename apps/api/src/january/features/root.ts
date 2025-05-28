import output from '#extensions/hono/output.ts';
import { dataSource } from '#extensions/postgresql/index.ts';

import { trigger, workflow } from '@januarylabs/declarative';

export default {
  EmptyFavicon: workflow({
    tag: 'root',
    trigger: trigger.http({
      method: 'get',
      path: '/favicon.ico',
    }),
    execute: async () => {
      return output.ok();
    },
  }),
  SayHi: workflow({
    tag: 'root',
    trigger: trigger.http({
      method: 'get',
      path: '/',
    }),
    execute: async () => {
      return {
        status: 'UP',
      };
    },
  }),
  HealthCheck: workflow({
    tag: 'root',
    trigger: trigger.http({
      method: 'get',
      path: '/health',
    }),
    execute: async () => {
      await dataSource.query('SELECT 1');
      return {
        status: 'UP',
      };
    },
  }),
};
