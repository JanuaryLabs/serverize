import { type Stage, dockerfile } from '../docker_file';
import { nginx, nodeServer } from '../servers';
import {
  type PackageManager,
  knownPackageManager,
  packageManagerCommands,
  stage,
} from '../utils';

const base: Stage = {
  from: nodeServer,
  packages: ['libc6-compat'],
};

const deps: (packageManager: PackageManager) => Stage = (
  packageManager?: PackageManager,
) => ({
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
    !knownPackageManager(packageManager)
      ? [
          'if [ -f yarn.lock ]; then yarn --frozen-lockfile;',
          'elif [ -f package-lock.json ]; then npm ci;',
          'elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile;',
          'else echo "Lockfile not found." && exit 1;',
          'fi',
        ]
      : packageManagerCommands[packageManager].install,
  ],
  output: ['node_modules'],
});

const builder: (config: {
  packageManager?: PackageManager;
  mode: NuxtOutputMode;
}) => Stage = (config) => {
  const buildScript = config.mode === 'static' ? 'generate' : 'build';
  return {
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
      !knownPackageManager(config.packageManager)
        ? [
            `if [ -f yarn.lock ]; then yarn run ${buildScript};`,
            `elif [ -f package-lock.json ]; then npm run ${buildScript};`,
            `elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run ${buildScript};`,
            'else echo "Lockfile not found." && exit 1;',
            'fi',
          ]
        : packageManagerCommands[config.packageManager].build.replace(
            'build',
            buildScript,
          ),
    ],
    environment: {
      NUXT_TELEMETRY_DISABLED: '1',
    },
    output:
      config.mode === 'static'
        ? [
            {
              src: '.output/public',
              dest: '.',
            },
          ]
        : ['.output'],
  };
};

export type NuxtOutputMode = 'ssr' | 'spa' | 'static';
export const nuxtjs = (config: {
  packageManager?: PackageManager;
  mode: 'ssr' | 'spa' | 'static';
}) =>
  dockerfile({
    stages: {
      base: stage(base),
      deps: stage(deps, config.packageManager),
      builder: stage(builder, config),
    },
    start:
      config.mode === 'static'
        ? nginx()
        : nodeServer({
            from: base,
            entry: '.output/server/index.mjs',
            environment: {
              NUXT_TELEMETRY_DISABLED: '1',
            },
          }),
  });
nuxtjs.dockerignore = [...nodeServer.dockerignore, '.nuxt'];
