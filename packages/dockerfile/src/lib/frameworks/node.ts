import { basename, dirname } from 'path';

import { type Stage, dockerfile } from '../docker_file';
import { nodeServer } from '../servers';
import {
  type PackageManager,
  guessPackageManager,
  knownPackageManager,
  packageManagerCommands,
  stage,
} from '../utils';

const base: (config: NodeJsConfig) => Stage = (config) => ({
  from: {
    image: `--platform=$BUILDPLATFORM node:${config.version ?? 'lts-alpine'}`,
    pm: 'apk',
  },
});

const devDeps: (config: { packageManager?: PackageManager }) => Stage = (
  config,
) => ({
  from: base,
  copy: {
    src: [
      'package.json',
      ...(!knownPackageManager(config.packageManager)
        ? guessPackageManager.lockFile
        : packageManagerCommands[config.packageManager].lockFile),
    ],
    dest: {
      path: '/temp/dev',
      create: true,
    },
  },
  run: {
    cmd: !knownPackageManager(config.packageManager)
      ? guessPackageManager.install
      : packageManagerCommands[config.packageManager].devinstall,
    cwd: '/temp/dev',
  },
});
const prodDeps: (config: { packageManager?: PackageManager }) => Stage = (
  config,
) => ({
  from: base,
  copy: {
    src: [
      'package.json',
      ...(!knownPackageManager(config.packageManager)
        ? guessPackageManager.lockFile
        : packageManagerCommands[config.packageManager].lockFile),
    ],
    dest: {
      path: '/temp/prod',
      create: true,
    },
  },
  run: {
    cmd: !knownPackageManager(config.packageManager)
      ? guessPackageManager.install
      : packageManagerCommands[config.packageManager].prodinstall,
    cwd: '/temp/prod',
  },
});

const builder: (config: NodeJsConfig) => Stage = (config) => ({
  from: base,
  workdir: '/app',
  copy: [
    { from: devDeps, src: '/temp/dev/node_modules', dest: 'node_modules' },
    ...(config.bundle
      ? [
          {
            from: prodDeps,
            src: '/temp/prod/node_modules',
            dest: 'node_modules',
          },
        ]
      : []),
    '.',
  ],
  run: [
    config.buildCommand ||
      (!knownPackageManager(config.packageManager)
        ? guessPackageManager.build
        : packageManagerCommands[config.packageManager].build),
  ],
});

export interface NodeJsConfig {
  packageManager?: PackageManager;
  buildCommand?: string;
  entrypoint: string;
  port?: string | number;
  version?: string;
  distDir?: string;
  bundle?: boolean;
}

export const nodejs = (config: NodeJsConfig) =>
  dockerfile({
    stages: {
      base: stage(base, config),
      devdeps: stage(devDeps, config),
      proddeps: stage(prodDeps, config),
      ...(config.buildCommand ? { builder: stage(builder, config) } : {}),
    },
    start: nodeServer({
      from: base,
      entry: config.entrypoint,
      port: config.port,
      copy: [
        config.buildCommand
          ? [
              {
                from: builder,
                link: config.distDir || basename(dirname(config.entrypoint)),
              },
              ...(config.bundle
                ? []
                : [
                    {
                      from: prodDeps,
                      src: '/temp/prod/node_modules',
                      dest: 'node_modules',
                    },
                  ]),
            ]
          : [
              {
                from: prodDeps,
                src: '/temp/prod/node_modules',
                dest: 'node_modules',
              },
              '.',
            ],
      ].flat(),
    }),
  });
nodejs.dockerignore = [...nodeServer.dockerignore];
