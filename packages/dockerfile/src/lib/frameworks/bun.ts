import { type Stage, dockerfile } from '../docker_file';
import { bunServer, nodeServer } from '../servers';
import { stage } from '../utils';

const base: Stage = {
  from: 'oven/bun:1',
  packages: ['wget'],
};

const installDev: Stage = {
  from: base,
  copy: [
    {
      src: ['package.json', 'bun.lockb'],
      dest: {
        path: '/temp/dev',
        create: true,
      },
    },
  ],
  run: [
    {
      cwd: '/temp/dev',
      cmd: 'bun install --frozen-lockfile',
    },
  ],
};

const installProd: Stage = {
  from: base,
  copy: [
    {
      src: ['package.json', 'bun.lockb'],
      dest: {
        path: '/temp/prod',
        create: true,
      },
    },
  ],
  run: [
    {
      cwd: '/temp/prod',
      cmd: 'bun install --frozen-lockfile --production',
    },
  ],
};

const prerelease: Stage = {
  from: base,
  copy: [
    {
      src: '/temp/dev/node_modules',
      dest: 'node_modules',
    },
    { link: '.' },
  ],
  run: 'bun run ./src/index.ts',
};

const release: Stage = {
  from: base,
  copy: [
    {
      src: '/temp/prod/node_modules',
      dest: 'node_modules',
    },
    { from: prerelease, link: '.' },
  ],
};

const deps: Stage = {
  from: base,
  workdir: '/app',
  copy: ['package.json', 'bun.lockb'],
  run: 'bun install --frozen-lockfile',
};
const builder: (config: {
  buildCommand: string;
  entrypoint: string;
}) => Stage = (config) => ({
  from: deps,
  workdir: '/app',
  copy: [{ from: deps, link: 'node_modules' }, '.'],
  run: config.buildCommand,
  output: config.entrypoint,
});

export const bun = (config: { buildCommand: string; entrypoint: string }) =>
  dockerfile({
    stages: {
      base,
      deps,
      builder: stage(builder, config),
    },
    start: bunServer({
      from: base,
      entry: 'index.js',
    }),
  });
bun.dockerignore = [...nodeServer.dockerignore];
