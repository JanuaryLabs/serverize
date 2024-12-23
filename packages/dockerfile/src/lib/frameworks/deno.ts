import { type Stage, dockerfile } from '../docker_file';
import { denoServer, nodeServer } from '../servers';

const base: Stage = {
  from: 'denoland/deno:alpine',
  workdir: '/app',
};

const deps: Stage = {
  from: base,
  workdir: '/app',
  copy: ['deno.{json*,lock}'],
  run: 'deno install',
};

const builder: Stage = {
  from: deps,
  workdir: '/app',
  copy: '.',
  run: 'deno compile --allow-net --allow-env --output entry main.ts',
};

export const deno = () =>
  dockerfile({
    stages: { base, deps, builder },
    start: denoServer({
      from: base,
      entry: {
        type: 'executable',
        value: 'entry',
      },
      copy: {
        from: builder,
        link: 'entry',
      },
    }),
  });

deno.dockerignore = [...nodeServer.dockerignore];
