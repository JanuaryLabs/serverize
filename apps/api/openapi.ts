import { execFile } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  analyze,
  responseAnalyzer as genericResponseAnalyzer,
} from '@sdk-it/generic';
import { responseAnalyzer } from '@sdk-it/hono';
import { generate } from '@sdk-it/typescript';

const { paths, components } = await analyze('apps/api/tsconfig.app.json', {
  commonZodImport: './apps/api/src/app/extensions/zod/index.ts',
  responseAnalyzer: {
    ...responseAnalyzer,
    ...genericResponseAnalyzer,
  },
});

const spec = {
  openapi: '3.1.0',
  info: {
    title: 'Serverize API',
    version: '1.0.0',
    contact: {
      name: 'API Support',
      url: 'https://serverize.sh',
      email: 'admin@january.sh',
    },
  },
  servers: [
    {
      url: 'https://serverize-api.january.sh',
      description: 'Prod server',
    },
    {
      url: 'http://localhost:3000',
      description: 'Local server',
    },
  ],
  paths,
  security: [{ bearerAuth: [] }],
  components: {
    ...components,
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    } as const,
  },
  tags: [],
};

await writeFile(
  join(process.cwd(), 'openapi.json'),
  JSON.stringify(spec, null, 2),
);

await generate(spec, {
  output: join(process.cwd(), 'packages/client/src'),
  name: 'Serverize',
  formatCode: ({ env, output }) => {
    execFile('biome', ['check', output, '--write'], { env: env });
  },
});
