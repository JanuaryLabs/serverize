import { dataSource } from '@workspace/extensions/postgresql';

import { feature, trigger, workflow } from '@january/declarative';

export default feature({
  workflows: [
    workflow('EmptyFavicon', {
      tag: 'root',
      trigger: trigger.http({
        method: 'get',
        path: '/favicon.ico',
      }),
      execute: async ({ output }) => {
        return output.ok();
      },
    }),
    workflow('SayHi', {
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
    workflow('HealthCheck', {
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
  ],
});
