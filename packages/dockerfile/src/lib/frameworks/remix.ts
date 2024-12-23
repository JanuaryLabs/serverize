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
  workdir: '/app',
  packages: ['libc6-compat'],
};

const deps: (options: { packageManager?: PackageManager }) => Stage = (
  options,
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
    !knownPackageManager(options.packageManager)
      ? [
          'if [ -f yarn.lock ]; then yarn --frozen-lockfile;',
          'elif [ -f package-lock.json ]; then npm ci;',
          'elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile;',
          'else echo "Lockfile not found." && exit 1;',
          'fi',
        ]
      : packageManagerCommands[options.packageManager].install,
  ],
});

const builder: (options: any) => Stage = (packageManager?: PackageManager) => ({
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
    !knownPackageManager(packageManager)
      ? [
          'if [ -f yarn.lock ]; then yarn run build;',
          'elif [ -f package-lock.json ]; then npm run build;',
          'elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build;',
          'else echo "Lockfile not found." && exit 1;',
          'fi',
        ]
      : packageManagerCommands[packageManager].build,
  ],
});

export type RemixOutputMode = 'ssr' | 'spa';
export const remix = (config: {
  packageManager?: PackageManager;
  mode: RemixOutputMode;
}) =>
  dockerfile({
    stages: {
      base: stage(base),
      deps: stage(deps, {
        packageManager: config.packageManager,
        mode: config.mode,
      }),
      builder: stage(builder, config.packageManager),
    },
    start:
      config.mode === 'spa'
        ? nginx({
            copy: [{ from: builder, src: 'build/client' }],
          })
        : nodeServer({
            from: base,
            entry: {
              type: 'script',
              value: 'start',
            },
            copy: [
              { from: builder, link: 'build' },
              { from: deps, link: 'node_modules' },
              'package.json',
            ],
          }),
  });

remix.dockerignore = [...nodeServer.dockerignore, '.astro'];
