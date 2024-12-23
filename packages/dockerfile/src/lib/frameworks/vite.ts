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
};

const deps: (config: { packageManager?: PackageManager }) => Stage = (
  config,
) => ({
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

const builder: (options: BuildConfig) => Stage = (options) => ({
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
    options.buildCommand ||
      (!knownPackageManager(options.packageManager)
        ? guessPackageManager.build
        : packageManagerCommands[options.packageManager].build),
  ],
});

interface BuildConfig {
  packageManager?: PackageManager;
  buildCommand?: string;
  distDir?: string;
}
export const vite = (options: BuildConfig) =>
  dockerfile({
    stages: {
      base: stage(base),
      deps: stage(deps, {
        packageManager: options.packageManager,
      }),
      builder: stage(builder, options),
    },
    start: nginx({
      copy: { from: builder, src: options.distDir || 'dist' },
    }),
  });

vite.dockerignore = [...nodeServer.dockerignore];
