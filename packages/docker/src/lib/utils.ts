import crypto from 'crypto';
import type { Container } from 'dockerode';
import { createReadStream, existsSync } from 'fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'os';

import { docker } from './instance';
import { basename, dirname, join } from 'path';
import type internal from 'stream';

export function followProgress(
  stream: NodeJS.ReadableStream,
  logger: Pick<Console, 'log'> = console,
) {
  return new Promise((resolve, reject) => {
    docker.modem.followProgress(
      stream,
      (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      },
      (obj) => {
        try {
          if ('error' in obj) {
            reject(obj);
          }
        } finally {
          logger.log(obj);
        }
      },
    );
  });
}

export async function upsertVolume(name: string) {
  try {
    return await docker.getVolume(name).inspect();
  } catch (error) {
    const { statusCode, message } = error as Error & { statusCode: number };
    if (statusCode === 404) {
      return await docker.createVolume({ Name: name });
    }
    throw error;
  }
}

export async function upsertNetwork(name: string) {
  let network = docker.getNetwork(name);

  try {
    await network.inspect();
  } catch {
    network = await docker.createNetwork({ Name: name });
  }

  return network;
}

export async function getContainer(containerId: string | { name: string }) {
  if (typeof containerId === 'string') {
    return docker.getContainer(containerId);
  }

  const containers = await docker.listContainers({ all: true });
  const container = containers.find((c) =>
    c.Names.includes(`/${containerId.name}`),
  );
  if (!container) {
    return null;
  }
  return docker.getContainer(container.Id);
}

export async function removeContainer(
  nameOrContainer: string | Container,
  wait?: number,
) {
  const container =
    typeof nameOrContainer === 'string'
      ? await getContainer({ name: nameOrContainer })
      : nameOrContainer;

  if (!container) {
    throw new Error('Container not found');
  }

  const isRunning = await isContainerRunning(container);
  if (isRunning) {
    const options = wait === 0 ? { t: wait } : {};
    await container.stop(options).catch(console.error);
  }
  await container
    .remove({
      force: wait === 0,
    })
    .catch(console.error);
}

export async function isContainerRunning(nameOrContainer: string | Container) {
  const container =
    typeof nameOrContainer === 'string'
      ? await getContainer({ name: nameOrContainer })
      : nameOrContainer;

  if (!container) {
    return false;
  }

  return container.inspect().then((info) => info.State.Running);
}

export function computeChecksum(filePath: string | internal.Readable) {
  return new Promise<string>((resolve, reject) => {
    const hash = crypto.createHash('md5');
    const stream =
      typeof filePath === 'string' ? createReadStream(filePath) : filePath;

    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', (err) => reject(err));
  });
}

export async function fileChanged(filePath: string, discrminator: string) {
  const checksumDirPath = join(tmpdir(), discrminator);
  await mkdir(checksumDirPath, { recursive: true });

  const checksumFilePath = join(checksumDirPath, basename(filePath));
  const currentChecksum = await computeChecksum(filePath);

  const flush = async () => {
    await rm(checksumFilePath, { force: true });
  };
  if (!existsSync(checksumFilePath)) {
    await writeFile(checksumFilePath, currentChecksum, 'utf-8');
    return {
      changed: true,
      flush,
    };
  }

  const storedChecksum = await readFile(checksumFilePath, 'utf-8');
  const changed = currentChecksum !== storedChecksum;

  if (changed) {
    await writeFile(checksumFilePath, currentChecksum, 'utf-8');
  }
  return {
    changed: changed,
    flush,
  };
}

export async function contentChanged(
  content: string,
  fileName: string,
  discrminator: string,
) {
  const checksumFilePath = join(tmpdir(), discrminator, fileName);
  await mkdir(dirname(checksumFilePath), { recursive: true });

  const filePath = join(tmpdir(), 'check', discrminator, fileName);
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, content, 'utf-8');

  const currentChecksum = await computeChecksum(filePath);
  const flush = async () => {
    await rm(checksumFilePath, { force: true });
  };
  if (!existsSync(checksumFilePath)) {
    await writeFile(checksumFilePath, currentChecksum, 'utf-8');
    return {
      changed: true,
      flush,
    };
  }

  const storedChecksum = await readFile(checksumFilePath, 'utf-8');
  const changed = currentChecksum !== storedChecksum;

  if (changed) {
    await writeFile(checksumFilePath, currentChecksum, 'utf-8');
  }
  return {
    changed: changed,
    flush,
  };
}

export async function followLogs(container: Container) {
  const stream = await container.logs({
    follow: true,
    stdout: true,
    stderr: true,
    details: true,
  });
  container.modem.demuxStream(stream, process.stdout, process.stderr);
}

export async function startContainer(
  name: string | Container,
  createContainer?: () => Promise<Container>,
) {
  let container: Container | null = null;
  if (typeof name === 'string') {
    container = await getContainer({ name });
  } else {
    container = name;
  }

  if (!container) {
    if (!createContainer) {
      throw new Error(`Cannot initialize server for project: ${name}`);
    }
    container = await createContainer();
  }

  const running = await isContainerRunning(container);
  if (!running) {
    await container.start().catch((error) => {
      if (error.statusCode === 304) {
        return;
      }
      throw error;
    });
  }
  return container;
}

export async function getContainerNet(
  containerId: string | { name: string } | Container,
) {
  let container: Container | null;
  if (typeof containerId === 'string' || 'name' in containerId) {
    container = await getContainer(containerId);
  } else {
    container = containerId;
  }
  if (!container) {
    throw new Error('Container not found');
  }
  const data = await container.inspect();
  return data.NetworkSettings;
}

export async function getContainerExternalPort(
  internalPort: string | number,
  containerId: string | { name: string } | Container,
) {
  let container: Container | null;
  if (typeof containerId === 'string' || 'name' in containerId) {
    container = await getContainer(containerId);
  } else {
    container = containerId;
  }
  if (!container) {
    throw new Error('Container not found');
  }
  const data = await container.inspect();
  return data.NetworkSettings.Ports[`${internalPort}/tcp`][0].HostPort;
}

export async function pushImage(repo: string, tag = 'latest') {
  const image = docker.getImage(repo);
  const stream = await image.push({
    authconfig: {
      username: 'docker user name',
      password: 'docker access token not personal password',
      serveraddress: 'https://index.docker.io/v1/',
    },
    tag,
  });
  await followProgress(stream);
  return image;
}

export async function pullImage(image: string, tag = 'latest') {
  const stream = await docker.createImage({
    fromImage: image,
    tag: tag,
    authconfig: {
      username: 'docker user name',
      password: 'docker access token not personal password',
      serveraddress: 'https://index.docker.io/v1/',
    },
  });
  await followProgress(stream);
  return image;
}

export async function imagesExists(...tags: string[]) {
  const images = await docker.listImages({
    all: true,
  });
  const imageTags = images.flatMap((image) => image.RepoTags);
  return tags.every((tag) => {
    return imageTags.includes(tag.includes(':') ? tag : `${tag}:latest`);
  });
}
