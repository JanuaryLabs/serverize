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
  commonZodImport: join(
    process.cwd(),
    'apps/api/src/app/extensions/zod/index.ts',
  ),
  responseAnalyzer: {
    ...responseAnalyzer,
    ...genericResponseAnalyzer,
  },
  onOperation: (sourceFile, method, path, operation) => {
    operation.responses ??= {};
    operation.responses[401] = {
      description: 'Unauthorized',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/UnauthorizedErr' },
        },
      },
    };
    return {};
  },
});

const spec: Parameters<typeof generate>[0] = {
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
  security: [{ bearerAuth: [] }],
  paths,
  components: {
    ...components,
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ...components.schemas,
      UnauthorizedErr: {
        type: 'object',
        required: ['type', 'title'],
        additionalProperties: false,
        properties: {
          type: {
            type: 'string',
            enum: ['Unauthorized'],
          },
          title: {
            type: 'string',
            enum: ['Authentication is required to access this resource.'],
          },
        },
      },
    },
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
  mode: 'minimal',
  style: {
    errorAsValue: true,
    outputType: 'default',
  },
  formatCode: ({ env, output }) => {
    execFile('biome', ['check', output, '--write'], { env: env });
  },
});
