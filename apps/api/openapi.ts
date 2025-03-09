import { execFile } from 'node:child_process';
import { rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { analyze, responseAnalyzer } from '@sdk-it/generic';
import { generate } from '@sdk-it/typescript';

const { paths, components } = await analyze('apps/api/tsconfig.app.json', {
  commonZodImport: './apps/api/src/app/extensions/zod/index.ts',
  responseAnalyzer,
  onOperation: (sourceFile, method, path, operation) => {
    if (path === '/container/logs') {
      return {
        [path as string]: {
          ['get']: {
            ...operation,
            responses: {
              200: {
                description: 'OK',
                content: {
                  'text/plain': {
                    schema: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
        },
      } as const;
    }
    return {};
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

await rm(join(process.cwd(), 'packages/client/src'), {
  recursive: true,
  force: true,
});

await generate(spec, {
  output: join(process.cwd(), 'packages/client/src'),
  name: 'Serverize',
  formatCode: ({ env, output }) => {
    execFile('biome', ['check', output, '--write'], { env: env });
  },
});
