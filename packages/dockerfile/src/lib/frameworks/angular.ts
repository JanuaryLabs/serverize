import { type Stage, dockerfile } from '../docker_file';
import { nginx, nodeServer } from '../servers';
import {
  type PackageManager,
  guessPackageManager,
  knownPackageManager,
  packageManagerCommands,
  stage,
} from '../utils';

const base: Stage = {
  from: nodeServer,
  workdir: '/app',
  packages: ['libc6-compat'],
};

const deps: (config: {
  packageManager?: PackageManager;
  mode: AngularOutputMode;
}) => Stage = (config) => ({
  from: base,
  workdir: '/app',
  copy: {
    src: [
      'package.json',
      ...(!knownPackageManager(config.packageManager)
        ? guessPackageManager.lockFile
        : packageManagerCommands[config.packageManager].lockFile),
    ],
    dest: '.',
  },
  run: [
    !knownPackageManager(config.packageManager)
      ? guessPackageManager.install
      : packageManagerCommands[config.packageManager].install,
  ],
});

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
    config.buildCommand ||
      (!knownPackageManager(config.packageManager)
        ? guessPackageManager.build
        : packageManagerCommands[config.packageManager].build),
  ],
});

export type AngularOutputMode = 'ssr' | 'spa';
interface BuildConfig {
  packageManager?: PackageManager;
  mode: AngularOutputMode;
  distDir: string;
  buildCommand?: string;
}
export const angular = (config: BuildConfig) =>
  dockerfile({
    stages: {
      base: stage(base),
      deps: stage(deps, {
        packageManager: config.packageManager,
        mode: config.mode,
      }),
      builder: stage(builder, config),
    },
    start:
      config.mode === 'spa'
        ? nginx({
            copy: {
              from: builder,
              src: `${config.distDir}/browser`,
            },
          })
        : nodeServer({
            from: base,
            copy: {
              from: builder,
              src: config.distDir,
            },
            entry: 'server/server.mjs',
          }),
  });

angular.dockerignore = [...nodeServer.dockerignore, '.angular'];
