import { type Stage, dockerfile } from '../docker_file';
import { nginx, nodeServer } from '../servers';
import {
  type PackageManager,
  guessPackageManager,
  knownPackageManager,
  packageManagerCommands,
  stage,
} from '../utils';

const base: (config: BuildConfig) => Stage = (config) => ({
  from: {
    image: `node:${config.nodejsVersion ?? 'lts-alpine'}`,
    pm: 'apk',
  },
  workdir: '/app',
  packages: ['libc6-compat'],
});

const deps: (config: {
  packageManager?: PackageManager;
  mode?: NextjsOutputMode;
}) => Stage = (config) => ({
  from: base,
  workdir: '/app',
  copy: {
    src: [
      'package.json',
      'yarn.lock*',
      'package-lock.json*',
      'pnpm-lock.yaml*',
    ],
    dest: '.',
  },
  run: [
    !knownPackageManager(config.packageManager)
      ? guessPackageManager.install
      : packageManagerCommands[config.packageManager].install,
  ],
});

interface BuildConfig {
  output: NextjsOutputMode;
  distDir?: string;
  packageManager?: PackageManager;
  buildCommand?: string;
  nodejsVersion?: string;
}

const builder: (config: BuildConfig) => Stage = (config) => ({
  from: base,
  workdir: '/app',
  copy: [
    {
      from: deps,
      link: 'node_modules',
    },
    { link: '.' },
  ],
  run: [
    config.output === 'export' ? '' : 'mkdir -p ./public',
    config.buildCommand ||
      (!knownPackageManager(config.packageManager)
        ? guessPackageManager.build
        : packageManagerCommands[config.packageManager].build),
  ],
  environment: {
    NEXT_TELEMETRY_DISABLED: '1',
  },
  output:
    config.output === 'export'
      ? []
      : config.output === 'standalone'
        ? [
            'public',
            '.next/static',
            {
              src: '.next/standalone',
              dest: '.',
            },
          ]
        : ['public', '.next'],
});

export type NextjsOutputMode = 'standalone' | 'export' | 'default';

export const nextjs = (config: BuildConfig) => {
  return dockerfile({
    stages: {
      base: stage(base, config),
      deps: stage(deps, config),
      builder: stage(builder, config),
    },
    start:
      config.output === 'export'
        ? nginx({
            copy: [{ src: config.distDir || 'out', from: builder }],
          })
        : nodeServer({
            from: base,
            entry: {
              ...(config.output === 'standalone'
                ? { type: 'file', value: 'server.js' }
                : { type: 'script', value: 'start' }),
            },
            copy: ['package.json', { from: deps, link: 'node_modules' }],
            environment: {
              NEXT_TELEMETRY_DISABLED: '1',
            },
          }),
  });
};
nextjs.dockerignore = [...nodeServer.dockerignore, '.next'];
