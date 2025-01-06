import { AsyncLocalStorage } from 'node:async_hooks';
import { rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, posix } from 'node:path';
import { execa } from 'execa';

import { ensureDockerRunning } from 'serverize/docker';
import { safeFail } from 'serverize/utils';
import type { NetworkFactory } from './network';

type StageFn = (options?: any) => Stage;
export interface ShortCopy {
  from?: string | Stage | StageFn;
  link: string;
}

export interface PointToPointCopy {
  from?: string | Stage | StageFn;
  src: string | string[];
  dest?: string | { path: string; create?: boolean };
}
export type StageCopy =
  | string
  | string[]
  | ShortCopy
  | ShortCopy[]
  | PointToPointCopy
  | PointToPointCopy[]
  | (PointToPointCopy | ShortCopy | string)[];

/**
 * Special type for of stage run command
 *
 * @example
 * {
 *   cmd: 'npm install',
 *   cwd: '/app',
 * }
 * // RUN cd /app && npm install
 */
interface StageRunCmd {
  /**
   * Whether to run the command as root
   */
  root?: boolean;
  /**
   * The working directory to run the command in
   */
  cwd?: string;
  /**
   * The command(s) to run
   */
  cmd: string | string[];
}

type StageRun =
  | (string | string[])
  | (string | string[] | string[][])[]
  | StageRunCmd
  | StageRunCmd[];

interface Image {
  image: string;
  pm: string;
}

/**
 * A stage is a set of instructions to build a container image
 */
export interface Stage {
  /**
   * The base image to use for the stage. It can be a string, an image object, stage object or result of a stage function
   */
  from: string | Image | Stage | StageFn;
  /**
   * The working directory to run the commands in
   */
  workdir?: string;
  /**
   * The commands to run in the stage
   */
  run?: StageRun;
  output?: string | (string | { src: string; dest: string })[];
  /**
   * The user to run the stage as
   */
  user?: string | undefined;
  /**
   * The files to copy into the stage
   */
  copy?: StageCopy;
  /**
   * Map of environment variables to set in the stage
   */
  environment?: Record<string, string | number>;
  /**
   * The packages to install in the stage.
   * The package manager is decided based on the image, if not specified
   * then apt-get will be used
   */
  packages?: string[];
}

export interface StartStage extends Stage {
  // FIXME: user should always be defined. we need better api to create users and give them direct permissions.
  user?: string;
  port: string | number;
  cmd?: string | string[];
  entrypoint?: string | string[];
  healthCheck?: {
    test: string;
    interval?: string;
    timeout?: string;
    retries?: string;
    startPeriod?: string;
  };
}

type Stages = Record<
  string,
  Stage | readonly [Stage] | readonly [Stage | StageFn, any?]
>;

const store = new AsyncLocalStorage<{
  stages: Stages;
  stagesSet: Record<string, StageFactory>;
}>();

export interface Dockerfile {
  /**
   * List of stages that prepares the container image
   */
  stages?: Stages;
  /**
   * The start stage is the stage that will be used to start the container
   * It's what you'd call final stage
   */
  start: StartStage;
}

export interface HasFrom {
  from: string | Stage | Image;
  workdir?: string;
}

export interface env {
  (name: string, value: string | number): StageFactory;
  (environment: Record<string, string | number>): StageFactory;
}

export interface StageFactory {
  config: Stage;
  from: (from: string | Stage) => StageFactory;
  env: env;
  user: (name: string) => StageFactory;
  addUser: () => StageFactory;
  addOutput: (value: string) => StageFactory;
  workdir: (workdir: string) => StageFactory;
  addCopy: (copy: StageCopy) => StageFactory;
  format: (name: string, stages: Record<string, Stage>) => string[];
  package: (...packages: string[]) => StageFactory;
}

function followStage(stages: Record<string, Stage>, stage: HasFrom) {
  return typeof stage.from === 'string'
    ? ([stage.from, stage] as const)
    : 'image' in stage.from
      ? ([stage.from.image, stage] as const)
      : (() => {
          const s = Object.entries(stages).find(([, stageValue]) => {
            return stageValue === stage.from;
          });
          if (!s) {
            throw new Error(
              `Stage ${JSON.stringify(stage.from.from)} not found`,
            );
          }
          return s;
        })();
}

function copyWriter(stages: Record<string, Stage>) {
  const writeCopy = (workdir: string, copy: PointToPointCopy | ShortCopy) => {
    const lines: string[] = [];
    if (!copy) return lines;
    if ('link' in copy) {
      lines.push(...writeShortCopy(workdir, copy));
    } else {
      lines.push(...writePointToPointCopy(workdir, copy));
    }
    return lines;
  };
  const writeShortCopy = (workdir: string, copy: ShortCopy) => {
    const lines: string[] = [];
    const fixedPoint = posix.normalize(posix.join('/', copy.link, '/'));
    const path = fixedPoint.replace(/^\//, './').replace(/\/$/, '');
    if (copy.from) {
      const relatedStage = followStage(stages, copy as HasFrom);

      lines.push(
        `COPY --from=${relatedStage[0]} ${posix.normalize(
          posix.join(
            store.getStore()?.stagesSet[relatedStage[0]].config.workdir || '',
            copy.link,
          ),
        )} ${path}`,
      );
    } else {
      lines.push(`COPY ${path} ${path}`);
    }
    return lines;
  };

  function writePointToPointCopy(
    workdir: string,
    copy: PointToPointCopy,
  ): string[] {
    function normalizeDest(srcs: string[], dest: string) {
      return dest === '.' ? (srcs.length === 1 ? '.' : './') : dest;
    }
    let instruction = 'COPY';
    let copySrcs = (Array.isArray(copy.src) ? copy.src : [copy.src]).map(
      (src) => posix.normalize(posix.join(src)),
    );
    if (copy.from) {
      const relatedStage = followStage(stages, copy as HasFrom);
      instruction = `COPY --from=${relatedStage[0]}`;

      copySrcs = copySrcs.map(
        (it) =>
          `${posix.normalize(
            posix.join(
              store.getStore()?.stagesSet[relatedStage[0]].config.workdir || '',
              it,
            ),
          )}`,
      );
    }
    if (!copy.dest) {
      const dest = '.';
      return [
        `${instruction} ${copySrcs.join(' ')} ${normalizeDest(copySrcs, dest)}`,
      ];
    }
    if (typeof copy.dest === 'string') {
      return [
        `${instruction} ${copySrcs.join(' ')} ${normalizeDest(copySrcs, copy.dest)}`,
      ];
    } else {
      const lines: string[] = [
        copy.dest.create
          ? `RUN mkdir -p ${posix.normalize(
              copy.dest.path.startsWith('/')
                ? copy.dest.path
                : posix.join('./', copy.dest.path),
            )}`
          : '',
        `COPY ${copySrcs.join(' ')} ${posix.normalize(
          copy.dest.path.startsWith('/')
            ? copySrcs.length > 1
              ? `${copy.dest.path}/`
              : copy.dest.path
            : posix.join('./', normalizeDest(copySrcs, copy.dest.path)),
        )}`,
      ];
      return lines;
    }
  }
  return {
    writeCopy,
    writeShortCopy,
    writePointToPointCopy,
  };
}

function createWriter(stages: Record<string, Stage>) {
  let entrypoint: string | string[] | undefined;
  let cmd: string | string[] | undefined;
  let expose: string | number | undefined;
  let healthCheck: StartStage['healthCheck'] | undefined;
  const stagesSet: Record<string, StageFactory> = {};

  return {
    cmd(value: string | string[]) {
      cmd = value;
    },
    entrypoint(value: string | string[]) {
      entrypoint = value;
    },
    set expose(port: string | number | undefined) {
      expose = port;
    },
    get expose() {
      return expose;
    },
    healthCheck(value: StartStage['healthCheck']) {
      healthCheck = value;
    },
    addStage(name: string, stage: StageFactory) {
      stagesSet[name] = stage;
    },
    print: () => {
      return store.run({ stages, stagesSet }, () => {
        const lines: string[] = [];
        Object.entries(stagesSet).forEach(([name, stage]) => {
          lines.push(...stage.format(name, stages));
        });
        if (expose) {
          lines.push(`EXPOSE ${expose}`);
        }
        if (entrypoint && entrypoint.length) {
          lines.push(
            `ENTRYPOINT [${coerceArray(entrypoint)
              .map((it) => safeFail(() => `"${JSON.parse(`"${it}"`)}"`, it))
              .join(', ')}]`,
          );
        }
        if (healthCheck) {
          const flags: string[] = [];
          if (healthCheck.interval) {
            flags.push(`--interval=${healthCheck.interval}`);
          }
          if (healthCheck.timeout) {
            flags.push(`--timeout=${healthCheck.timeout}`);
          }
          if (healthCheck.retries) {
            flags.push(`--retries=${healthCheck.retries}`);
          }
          if (healthCheck.startPeriod) {
            flags.push(`--start-period=${healthCheck.startPeriod}`);
          }
          flags.push(`CMD ${healthCheck.test}`);
          lines.push(`HEALTHCHECK ${flags.join(' ')}`);
        }
        if (cmd && cmd.length) {
          lines.push(
            `CMD [${coerceArray(cmd)
              .map((it) => safeFail(() => `"${JSON.parse(`"${it}"`)}"`, it))
              .join(', ')}]`,
          );
        }

        return lines.join('\n').trim();
      });
    },
  };
}

export function coerceArray<T>(value: T): T[] {
  return Array.isArray(value) ? value : [value];
}

function stageFactory(config: Stage): StageFactory {
  // const environments: Record<string, string | number> = {};
  // config = structuredClone(config);
  config.environment ??= {};
  function env(name: string, value: string | number): StageFactory;
  function env(name: Record<string, string | number>): StageFactory;
  function env(
    this: StageFactory,
    name: string | Record<string, string | number>,
    value?: string | number,
  ): StageFactory {
    if (typeof name === 'string') {
      if (value) {
        config.environment![name] = String(value);
        return this;
      }
    } else {
      Object.entries(name).forEach(
        ([name, value]) => (config.environment![name] = value),
      );
    }
    return this;
  }
  return {
    config,
    package(...packages) {
      config.packages = packages;
      return this;
    },
    from(from) {
      config.from = from;
      return this;
    },
    workdir(workdir) {
      config.workdir = workdir;
      return this;
    },
    addCopy(value: StageCopy) {
      // TODO: if the same src exists, we need to overwrite it
      if (!config.copy) {
        config.copy = value;
        return this;
      }
      value = Array.isArray(value) ? value : [value];
      if (Array.isArray(config.copy)) {
        config.copy = [...config.copy, ...value];
      } else {
        config.copy = [
          ...(Array.isArray(config.copy) ? config.copy : [config.copy]),
          ...value,
        ];
      }

      return this;
    },
    addUser() {
      return this;
    },
    user(name) {
      config.user = name;
      return this;
    },
    addOutput(value) {
      config.output;
      return this;
    },
    env,
    format: (name: string, stages: Record<string, Stage>) => {
      const lines: string[] = [];
      const pkgs = config.packages || [];
      const moreCopies: (ShortCopy | PointToPointCopy)[] = [];
      if (config.from) {
        lines.push('\n');
        const [from] = followStage(stages, config as HasFrom);
        lines.push(`FROM ${from} AS ${name}`);

        // if (typeof config.from !== 'string') {
        //   const output = (
        //     config.from?.output
        //       ? Array.isArray(config.from.output)
        //         ? config.from.output
        //         : [config.from.output]
        //       : []
        //   ).map((it) => {
        //     const src = typeof it === 'string' ? it : it.src;
        //     const dest = typeof it === 'string' ? it : it.dest;
        //     return {
        //       from,
        //       src,
        //       dest,
        //     } satisfies ShortCopy | PointToPointCopy;
        //   });
        //   moreCopies.push(...output);
        // }
      }

      const pm =
        typeof config.from === 'string'
          ? ''
          : 'pm' in config.from
            ? config.from.pm
            : 'apt-get';

      if (pkgs.length) {
        if (pm === 'apk') {
          lines.push(`RUN apk update && apk add --no-cache ${pkgs.join(' ')}`);
        } else {
          lines.push(
            `RUN apt-get update && apt-get install -y ${pkgs.join(' ')}`,
          );
        }
      }

      if (config.workdir) {
        lines.push(`WORKDIR ${config.workdir}`);
      }

      if (config.copy) {
        const copies = Array.isArray(config.copy) ? config.copy : [config.copy];
        for (const copy of [...copies, ...moreCopies]) {
          lines.push(
            ...copyWriter(stages).writeCopy(
              config.workdir || '',
              typeof copy === 'string' ? { src: copy } : copy,
            ),
          );
        }
      }

      Object.entries(config.environment ?? {}).forEach(([name, value]) => {
        lines.push(`ENV ${name}=${value}`);
      });

      const run = coerceArray(config.run ?? []);
      const userIndex = lines.length - 1;
      if (config.user) {
        lines.push(`USER ${config.user}`);
      }
      run.forEach((it) => {
        if (typeof it === 'string') {
          if (it.trim()) {
            lines.push(`RUN ${it.trim()}`);
          }
        } else if (Array.isArray(it)) {
          const cmds = [
            '\\',
            ...it.map((l, index, arr) => {
              if (arr.length === index + 1) return `\t${l}`;
              return `\t${l} \\`;
            }),
          ];
          lines.push(`RUN ${cmds.join('\n')}`);
        } else {
          const cmds = [it.cwd ? `cd ${it.cwd}` : '', ...coerceArray(it.cmd)]
            .filter(Boolean)
            .join(' && ');
          if (it.root) {
            lines.splice(userIndex, 0, `RUN ${cmds}`);
          } else {
            lines.push(`RUN ${cmds}`);
          }
        }
      });

      return lines;
    },
  };
}

export interface DockerfileFactory {
  print: () => string;
  save: (filePath: string) => Promise<void>;
  run: (options?: RuntimeOptions) => Promise<{
    remove: () => Promise<void>;
  }>;
  build: (options?: BuildOptions) => Promise<string>;
  deploy: (options?: DeployOptions) => Promise<void>;
}

export function dockerfile(config: Dockerfile): DockerfileFactory {
  const dismantleStage = (value: Stages[string]) =>
    Array.isArray(value) ? value[0] : value;
  config.stages ??= {};
  const stages = Object.entries(config.stages).reduce(
    (acc, [name, value]) => ({
      ...acc,
      [name]: dismantleStage(value),
    }),
    {} as Record<string, Stage>,
  );
  const writer = createWriter(stages);
  const startStage = stageFactory(config.start)
    .env(config.start.environment ?? {})
    .env('PORT', config.start.port);

  Object.entries(config.stages).forEach(([name, value]) => {
    const stageConfig: Stage = Array.isArray(value)
      ? typeof value[0] === 'function'
        ? value[0](value[1])
        : value[0]
      : value;

    writer.addStage(name, stageFactory(stageConfig));

    const output: PointToPointCopy[] = (
      stageConfig.output
        ? Array.isArray(stageConfig.output)
          ? stageConfig.output
          : [stageConfig.output]
        : []
    ).map((it) => {
      const src = typeof it === 'string' ? it : it.src;
      const dest = typeof it === 'string' ? it : it.dest;
      return {
        from: dismantleStage(value),
        src,
        dest,
      };
    });
    startStage.addCopy(output);
  });

  writer.addStage('start', startStage);
  writer.expose = config.start.port;
  writer.entrypoint(config.start.entrypoint ?? []);
  writer.cmd(config.start.cmd ?? []);
  writer.healthCheck(config.start.healthCheck);

  return {
    print: () => writer.print(),
    save: (filePath: string) => {
      return writeFile(filePath, writer.print(), 'utf-8');
    },
    async build(options: BuildOptions = {}) {
      await ensureDockerRunning();
      const tmpPath = join(tmpdir(), crypto.randomUUID());
      await writeFile(tmpPath, writer.print(), 'utf-8');
      const imageName = crypto.randomUUID().split('-')[0];
      const context = options.cwd ?? process.cwd();
      await execa({
        stdio: 'inherit',
      })`docker build --rm --pull --tag ${imageName} --file ${tmpPath} ${context}`;
      await rm(tmpPath, { force: true });
      return `${imageName}:latest`;
    },
    async run(options: RuntimeOptions = {}) {
      await ensureDockerRunning();
      const name = options.name || crypto.randomUUID().split('-')[0];
      const networks: string[] = [];
      const imageName = await this.build();
      const args: string[] = ['run', '--rm', '-it'];

      for (const network of options.networks ?? []) {
        if (typeof network === 'string') {
          networks.push(network);
        } else {
          const name = await network.upsert();
          networks.push(name);
        }
      }

      if (name) {
        args.push(`--name`, name);
      }
      if (options.force) {
        //
      }
      if (options.detached) {
        args.push('-d');
      }
      if (options.memory) {
        args.push(`--memory`, options.memory);
      }
      if (options.memorySwap) {
        args.push(`--memory-swap`, options.memorySwap);
      }
      if (options.memoryReservation) {
        args.push(`--memory-reservation`, options.memoryReservation);
      }
      if (writer.expose) {
        args.push(`-p`, `${writer.expose}:${writer.expose}`);
      }
      args.push(imageName);
      // TODO: listen to docker events and when the container is created
      // connect the networks

      // workaround for now
      if (networks.length) {
        args.push('--network', networks[0]);
      }
      await execa('docker', args, {
        stdio: 'inherit',
        extendEnv: true,
        env: {
          DOCKER_CLI_HINTS: 'false',
          DOCKER_BUILDKIT: '1',
        },
      });
      return {
        remove: async () => {
          await execa('docker', ['rm', name], {
            stdio: 'inherit',
          });
        },
      };
    },
    deploy() {
      throw new Error('Not implemented');
    },
  };
}

interface BuildOptions {
  /**
   * The dockerfile context
   * @default process.cwd()
   */
  cwd?: string;
}
interface RuntimeOptions {
  /**
   * The name of the container
   */
  name?: string;
  /**
   * A memory limit for the container (aka hard memory limit)
   * @example 100m, 1g
   */
  memory?: string;
  /**
   * A memory swap limit for the container, if memory is defined then it'll be 2x memory
   * @example 100m, 1g
   */
  memorySwap?: string;
  /**
   * A memory reservation limit for the container (aka soft memory limit)
   * @example 100m, 1g
   */
  memoryReservation?: string;
  /**
   * The default network to use for the container.
   */
  defaultNetwork?: NetworkFactory | string;
  /**
   * List of networks to connect the container to.
   */
  networks?: (NetworkFactory | string)[];

  /**
   * Force the container to be recreated even if another takes the same port
   */
  force?: boolean;

  detached?: boolean;
}

export interface DeployOptions {
  projectName: string;
  channel?: string;
}
