import type { StartStage } from './docker_file';

type RuntimeConfig = Omit<StartStage, 'cmd' | 'port' | 'user'> & {
  allowWrite?: string[];
};

interface NodeRuntimeConfig extends RuntimeConfig {
  port?: string | number;
  entry:
    | string
    | { type: 'script'; value: string }
    | { type: 'file'; value: string };
}
interface BunRuntimeConfig extends RuntimeConfig {
  entry: string;
}

export function nodeServer(entrypoint: string): StartStage;
export function nodeServer(config: NodeRuntimeConfig): StartStage;
export function nodeServer(config: string | NodeRuntimeConfig): StartStage {
  if (typeof config === 'string') {
    const port = 3000;
    return {
      from: nodeServer,
      workdir: '/app',
      cmd: `node ${config}`,
      port,
      user: 'node',
      healthCheck: {
        test: `wget --no-verbose --spider --tries=1 http://localhost:${port} || exit 1`,
      },
      environment: {
        NODE_ENV: 'production',
        HOST: '0.0.0.0',
      },
    };
  }

  const additionalProps: Partial<StartStage> = {};
  if (typeof config.entry === 'string') {
    additionalProps.cmd = [`node`, config.entry];
  } else if (config.entry.type === 'script') {
    additionalProps.cmd = ['npm', 'run', config.entry.value];
  } else if (config.entry.type === 'file') {
    additionalProps.cmd = ['npm', config.entry.value];
  } else {
    throw new Error('Invalid entry type');
  }
  const port = config.port ?? 3000;
  return {
    workdir: '/app',
    user: 'node',
    ...config,
    ...additionalProps,
    healthCheck: {
      test: `wget --no-verbose --spider --tries=1 http://localhost:${port} || exit 1`,
      ...config.healthCheck,
    },
    port,
    from: config.from ?? nodeServer,
    environment: {
      NODE_ENV: 'production',
      HOST: '0.0.0.0',
      ...(config.environment ?? {}),
    },
  };
}
denoServer.image = 'denoland/deno:alpine';
denoServer.pm = 'apk';

interface DenoRuntimeConfig extends RuntimeConfig {
  entry:
    | { type: 'script'; value: string }
    | {
        type: 'file';
        value: string;
        flags: (
          | '--allow-net'
          | '--allow-env'
          | '--allow-read'
          | '--allow-write'
        )[];
      }
    | {
        type: 'executable';
        value: string;
      };
}

export function denoServer(entrypoint: string): StartStage;
export function denoServer(config: DenoRuntimeConfig): StartStage;
export function denoServer(config: string | DenoRuntimeConfig): StartStage {
  if (typeof config === 'string') {
    return {
      from: denoServer,
      workdir: '/app',
      cmd: [`deno`, '--allow-net', config],
      port: 8000,
      user: 'deno',
      environment: {
        NODE_ENV: 'production',
        HOST: '0.0.0.0',
      },
    };
  }

  const additionalProps: Partial<StartStage> = {};
  if (config.entry.type === 'script') {
    additionalProps.cmd = ['deno', 'task', config.entry.value];
  } else if (config.entry.type === 'file') {
    additionalProps.cmd = [
      'deno',
      'run',
      ...config.entry.flags,
      config.entry.value,
    ];
  } else if (config.entry.type === 'executable') {
    additionalProps.cmd = [`./${config.entry.value}`];
  } else {
    throw new Error('Invalid entry type');
  }

  return {
    workdir: '/app',
    ...additionalProps,
    port: 8000,
    user: 'deno',
    ...config,
    from: config.from ?? denoServer,
    environment: {
      NODE_ENV: 'production',
      HOST: '0.0.0.0',
      ...(config.environment ?? {}),
    },
  };
}

nodeServer.image = 'node:lts-alpine';
nodeServer.pm = 'apk';
nodeServer.dockerignore = [
  '**/node_modules/',
  '**/.git',
  '**/README.md',
  '**/LICENSE',
  '**/.vscode',
  '**/.idea',
  '**/npm-debug.log',
  '**/coverage*',
  '**/.env',
  '**/.editorconfig',
  '**/.aws',
  '**/dist',
  '**/build',
  '**/.output',
  '**/output',
  '**/tmp',
  '**/test-results',
  '**/tests',
  '**/__tests__',
  '**/docs',
  '.dockerignore',
  'docker-compose*',
  'compose*.{yml,yaml}',
  '.gitignore',
  'Dockerfile*',
  'Jenkinsfile*',
  'helm-charts',
  'Makefile',
  'Thumbs.db',
  '.DS_Store',
];

export function bunServer(entrypoint: string): StartStage;
export function bunServer(config: BunRuntimeConfig): StartStage;
export function bunServer(config: string | BunRuntimeConfig): StartStage {
  if (typeof config === 'string') {
    return {
      from: bunServer,
      user: 'bun',
      workdir: '/app',
      port: 3000,
      cmd: `bun ${config}`,
      environment: {
        NODE_ENV: 'production',
        HOST: '0.0.0.0',
      },
    };
  }

  return {
    user: 'bun',
    workdir: '/app',
    port: 3000,
    cmd: ['bun', 'run', config.entry],
    ...config,
    from: config.from ?? bunServer,
    environment: {
      NODE_ENV: 'production',
      HOST: '0.0.0.0',
      ...(config.environment ?? {}),
    },
  };
}
bunServer.image = 'oven/bun:1';

export function nginx(
  config: Omit<RuntimeConfig, 'entrypoint' | 'from'> & {
    from?: RuntimeConfig['from'];
  } = {},
): StartStage {
  return {
    workdir: '/usr/share/nginx/html',
    user: 'nginx',
    port: 8080,
    cmd: ['nginx', '-g', '"daemon off;"'],
    environment: {},
    healthCheck: {
      test: 'curl -f http://localhost:8080 || exit 1',
    },
    ...config,
    from: config.from ?? 'nginxinc/nginx-unprivileged',
  };
}

export function httpd(): StartStage {
  return {
    from: 'httpd:alpine',
    workdir: '/usr/local/apache2/htdocs/',
    user: 'nginx',
    port: 80,
    cmd: 'nginx -g "daemon off;"',
    environment: {},
  };
}
denoServer.dockerignore = [...nodeServer.dockerignore, '.vscode'];
