import { Releases } from '@serverize/client';
import { tmpdir } from 'os';
import { join } from 'path';

import {
  docker,
  removeContainer,
  upsertNetwork,
  upsertVolume,
} from 'serverize/docker';
import { createRecorder } from 'serverize/utils';

interface Config {
  domainPrefix: string;
  network: string;
  serviceName?: string;
  volumes?: Releases['volumes'];
  environment?: Record<string, string>;
}

export async function createRemoteServer(
  signal: AbortSignal,
  config: Config,
  processImage: () => Promise<string>,
  instructions: {
    memory?: number;
    Healthcheck?: Record<string, any>;
    hostPort?: string;
  },
) {
  const recorder = createRecorder({
    label: `createClientServer:${config.domainPrefix}`,
    verbose: true,
  });

  const runnerContainerName = config.domainPrefix;

  recorder.record('processImage');
  const runnerImageTag = await processImage();
  recorder.recordEnd('processImage');

  {
    recorder.record('removeContainer');
    await removeContainer(config.domainPrefix).catch(() => {
      // noop
    });
    recorder.recordEnd('removeContainer');
  }
  {
    recorder.record('startContainer');
    try {
      const container = await createRemoteContainer(
        signal,
        config,
        runnerContainerName,
        runnerImageTag,
        instructions,
      );
      await container.start();
    } catch (error) {
      console.error(error);
      // kill the container in case of an error so the next time it will be recreated
      {
        recorder.record('removingErroredContainer');
        await removeContainer(runnerContainerName).catch(() => {
          // noop
        });
        recorder.recordEnd('removingErroredContainer');
      }
      throw error;
    }
    recorder.recordEnd('startContainer');
  }
  recorder.end();
  return runnerContainerName;
}

export async function createRemoteContainer(
  signal: AbortSignal,
  config: Config,
  containerName: string,
  imageTag: string,
  instructions: {
    memory?: number;
    hostPort?: string;
    Healthcheck?: Record<string, any>;
  },
) {
  const network = await upsertNetwork(config.network);
  for (const volume of config.volumes ?? []) {
    await upsertVolume(volume.src);
  }
  const healthcheck = instructions.Healthcheck
    ? instructions.Healthcheck
    : undefined;

  if (healthcheck?.Test?.length) {
    const cmd: string[] = healthcheck.Test[0].split(' ');
    const removeExit = cmd.findIndex((it) => it.toLowerCase() === 'exit');
    let exit: string[] = [];
    if (removeExit !== -1) {
      // cmd = cmd.slice(0, removeExit - 1); // -1 to remove "||"
      exit = cmd.splice(removeExit - 1);
    }
    healthcheck.Test = cmd.flat().filter(Boolean);
  }

  const container = await docker.createContainer({
    name: containerName,
    Image: imageTag,
    abortSignal: signal,
    Env: [
      ...Object.entries(config.environment ?? {}).map(
        ([key, value]) => `${key}=${value}`,
      ),
    ],
    Labels: {
      'sablier.enable': 'true',
      'sablier.group': containerName,
      // TODO: it should also be the compose name (which is the group) as well
      // when the project is compose
    },
    Volumes: {},
    platform:
      process.env['NODE_ENV'] === 'production' ? 'linux/amd64' : undefined,
    HostConfig: {
      ...memory(instructions.memory),
      NetworkMode: 'traefik-network', // needed for traefik to discover the container
      Binds: (config.volumes ?? []).map(
        (volume) => `${volume.src}:${volume.dest}`,
      ),
      RestartPolicy: {
        Name: 'on-failure',
        MaximumRetryCount: 2,
      },
      CpuPercent: 5,
    },
    Healthcheck: healthcheck,
  });
  await network.connect({
    Container: container.id,
    ...(config.serviceName
      ? {
          EndpointConfig: {
            Aliases: [config.serviceName],
          },
        }
      : {}),
  });

  return container;
}

export function makeProjectPath(projectId: string) {
  return join(tmpdir(), 'client-server', projectId);
}

function memory(value?: number) {
  // TODO: should we have MemoryReservation? if docker doesn't allocate anything to idle containers, then we don't need it
  const defaultRamReservePerContainerMb = 16;
  const defaultRamLimitPerContainerMb = Math.min(value || Infinity, 96);
  const defaultSwapPerContainerMb = defaultRamLimitPerContainerMb * 4;
  return {
    Memory: defaultRamLimitPerContainerMb * 1024 * 1024,
    MemorySwap: defaultSwapPerContainerMb * 1024 * 1024,
    MemoryReservation:
      (defaultRamReservePerContainerMb as any) === defaultRamLimitPerContainerMb
        ? undefined
        : defaultRamReservePerContainerMb * 1024 * 1024,
  };
}
