import {
  compose,
  nodeServer,
  postgres,
  service,
} from 'serverize/dockercompose';

await compose({
  database: service(postgres),
  server: service({
    ...nodeServer({
      dockerfile: 'Dockerfile.serverize',
    }),
    depends_on: [postgres],
  }),
}).write();
