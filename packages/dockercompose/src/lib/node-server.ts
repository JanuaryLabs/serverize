import type { ComposeService } from './compose';
import { removeDuplicates } from 'serverize/utils';

interface NodeServerOptions {
  image?: string;
  port?: string;
  env?: Record<string, string>;
  env_file?: string[];
  dockerfile: string;
  entrypoint?: string;
}

export const nodeServer: (options?: NodeServerOptions) => ComposeService = (
  options = {
    image: 'api',
    port: '3000',
    dockerfile: 'Dockerfile',
    env: {},
  },
) => {
  options.port ??= '3000';
  return {
    image: options.image || 'node-api',
    build: {
      context: '.',
      dockerfile: options.dockerfile,
    },
    restart: 'unless-stopped',
    networks: ['development'],
    ports: [`${options.port}:${options.port}`, '9229:9229'],
    environment: {
      NODE_ENV: 'development',
      ...options.env,
      PORT: options.port,
    },
    env_file: removeDuplicates(
      options.env_file ?? ['.env', '.env.compose'],
      (key) => key,
    ),
    command: `node --watch ${options.entrypoint || './'}`,
    develop: {
      watch: [
        {
          action: 'sync',
          path: './output/build/server.js',
          target: '/app/build/server.js',
          ignore: ['node_modules/'],
        },
        {
          action: 'rebuild',
          path: './output/package.json',
        },
        {
          action: 'rebuild',
          path: './package.json',
        },
      ],
    },
  };
};
