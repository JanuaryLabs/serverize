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

const deps: (options: {
  packageManager?: PackageManager;
  mode: AstroOutputMode;
}) => Stage = (options) => ({
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
      ? guessPackageManager.install
      : packageManagerCommands[options.packageManager].install,
  ],
  output: options.mode !== 'static' ? ['node_modules'] : [],
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
  output: [{ src: 'dist', dest: '.' }],
});

export type AstroOutputMode = 'server' | 'hybrid' | 'static';
interface BuildConfig {
  packageManager?: PackageManager;
  mode: AstroOutputMode;
  buildCommand?: string;
}
export const astrojs = (config: BuildConfig) =>
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
      config.mode === 'static'
        ? nginx()
        : nodeServer({
            from: base,
            entry: 'server/entry.mjs',
          }),
  });

astrojs.dockerignore = [...nodeServer.dockerignore, '.astro'];
