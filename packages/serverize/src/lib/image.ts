import chalk from 'chalk';
import { parse } from 'dotenv';
import { execa } from 'execa';
import { type ReadStream, createReadStream, readFileSync } from 'fs';
import { readFile, stat, writeFile } from 'fs/promises';
import yaml from 'js-yaml';
import { tmpdir } from 'os';
import { join } from 'path';

import {
  type Healthcheck,
  logger,
  printDivider,
  refineHealthcheck,
  spinner,
  toAst,
} from '../program';

export interface ImageDetails {
  filePath: string;
  fileSize: number;
  fileStream: ReadStream;
  image: string;
}
export async function saveImage(imageName: string): Promise<ImageDetails> {
  const tarFilePath = join(tmpdir(), `${crypto.randomUUID()}.tar`);
  await execa('docker', ['save', '-o', tarFilePath, imageName], {
    cwd: process.cwd(),
    stdio: 'inherit',
    extendEnv: true,
    env: {
      DOCKER_CLI_HINTS: 'false',
      DOCKER_BUILDKIT: '1',
    },
  });
  const fileSize = (await stat(tarFilePath)).size;
  const fileStream = createReadStream(tarFilePath);
  return {
    image: imageName,
    filePath: tarFilePath,
    fileSize: fileSize,
    fileStream: fileStream,
  };
}

export async function buildImage(imageName: string, filePath: string) {
  printDivider();
  logger(`Building image ${chalk.green(imageName)} from ${filePath} with context ${process.cwd()}`);
  const options = [
    '--pull',
    '--rm',
    '--tag',
    imageName,
    '--file',
    filePath,
    '--platform',
    'linux/amd64',
    '.',
  ].filter(Boolean);
  logger(`docker build ${options.join(' ')}`);
  await execa(`docker`, ['build', ...options], {
    cwd: process.cwd(),
    stdio: 'inherit',
    extendEnv: true,
    env: {
      DOCKER_CLI_HINTS: 'false',
      DOCKER_BUILDKIT: '1',
    },
  });
  printDivider();
}

export async function buildCompose(
  imageName: (serviceName: string) => string,
  filePath: string,
  cwd: string,
) {
  const compose: any = yaml.load(await readFile(filePath, 'utf-8'));
  const tempPath = join(tmpdir(), crypto.randomUUID());
  const serviceConfigMap: ComposeServiceConfig[] = [];
  const servicesEntries = Object.entries(compose.services) as [string, any][];

  // const ports = servicesEntries
  //   .map(([serviceName, service]) => {
  //     const ports = service.expose
  //       ? (service.expose.map((port: string) => ({
  //           internal: port,
  //           external: port,
  //         })) as ComposePort[])
  //       : mapPorts(service.ports ?? []);
  //     return ports.length
  //       ? ports.map((port) => ({ service: serviceName, ...port }))
  //       : [];
  //   })
  //   .flat();

  const ports = servicesEntries.map(([serviceName, service]) => {
    return ((service.expose ?? []) as string[]).map((port) => ({
      service: serviceName,
      port: port,
    }));
  });

  if (!ports.flat().length) {
    spinner.fail(
      'No ports found in the compose file. Please add expose statement to HTTP services (frontend, backend, ...etc)',
    );
    process.exit(1);
  }

  // const selectedPorts = await multiselect({
  //   title: `Select ports to expose (${chalk.red.bold('HTTP only')})\n`,
  //   choices: ports.flat().map((port) => ({
  //     name: `${port.service}:${port.port}`,
  //     value: JSON.stringify(port),
  //   })),
  //   required: true,
  // }).then((selected) => selected.map((port) => JSON.parse(port)));

  spinner.info(
    `Exposing ${ports
      .flat()
      .map((port) => chalk.green(`${port.service}:${port.port}`))
      .join(', ')}`,
  );

  for (const service of servicesEntries) {
    const [serviceName, serviceConfig] = service as any;
    const environment = Array.isArray(serviceConfig.environment)
      ? serviceConfig.environment.reduce(
          (acc: any, env: any) => {
            const [key, value] = env.split('=');
            return { ...acc, [key]: value };
          },
          {} as Record<string, string>,
        )
      : serviceConfig.environment;
    const healthcheck = serviceConfig.healthcheck
      ? refineHealthcheck({
          Interval: serviceConfig.healthcheck.interval,
          Timeout: serviceConfig.healthcheck.timeout,
          Retries: serviceConfig.healthcheck.retries,
          StartPeriod: serviceConfig.healthcheck.start_period,
          Test: serviceConfig.healthcheck.test,
        })
      : serviceConfig.build
        ? await toAst(
            join(cwd, '.dockerignore'),
            join(cwd, getDockerfileFromBuild(serviceConfig.build)),
          ).then((ast) => ast.healthCheckOptions)
        : undefined;
    serviceConfigMap.push({
      name: serviceName,
      healthcheck: healthcheck,
      image: serviceConfig.build?.context
        ? imageName(serviceName)
        : serviceConfig.image,
      port: ports.flat().find((port) => port.service === serviceName)?.port,
      environment: {
        ...((serviceConfig.env_file ?? []) as string[]).reduce(
          (acc, file) => {
            return {
              ...acc,
              ...parse(readFileSync(join(cwd, file), 'utf-8')),
            };
          },
          {} as Record<string, string>,
        ),
        ...environment,
      },
      volumes: serviceConfig.volumes,
    });

    compose.services[serviceName] = {
      platform: 'linux/amd64',
      ...serviceConfig,
      ...Object.assign(
        typeof serviceConfig.build === 'string'
          ? {
              image: serviceConfigMap.at(-1)?.image,
              build: join(cwd, serviceConfig.build),
            }
          : serviceConfig.build?.context
            ? {
                image: serviceConfigMap.at(-1)?.image,
                build: {
                  ...serviceConfig.build,
                  context: join(cwd, serviceConfig.build?.context),
                },
              }
            : {},
      ),
    };
  }
  await writeFile(
    tempPath,
    yaml.dump(compose, {
      skipInvalid: false,
      noRefs: true,
      forceQuotes: true,
      noCompatMode: true,
      schema: yaml.JSON_SCHEMA,
      quotingType: '"',
    }),
  );
  // console.log('\n');
  printDivider();
  // await execa('docker', ['compose', '-f', tempPath, 'pull'], {
  //   cwd: process.cwd(),
  //   stdio: 'inherit',
  //   extendEnv: true,
  //   env: {
  //     DOCKER_CLI_HINTS: 'false',
  //     DOCKER_BUILDKIT: '1',
  //   },
  // });
  await execa('docker', ['compose', '-f', tempPath, 'build', '--pull'], {
    cwd: process.cwd(),
    stdio: 'inherit',
    extendEnv: true,
    env: {
      DOCKER_CLI_HINTS: 'false',
      DOCKER_BUILDKIT: '1',
    },
  });
  // console.log('\n');
  printDivider();
  return {
    volumes: compose.volumes,
    services: serviceConfigMap,
  };
}

interface ComposeServiceConfig {
  name: string;
  image: string;
  healthcheck?: Healthcheck;
  port?: string;
  environment?: Record<string, string>;
  volumes?: string[];
}

function getDockerfileFromBuild(
  build:
    | string
    | {
        context: string;
        dockerfile?: string;
      },
) {
  return typeof build === 'string'
    ? build
    : join(build.context, build.dockerfile ?? 'Dockerfile');
}
