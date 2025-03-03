import type { Container } from 'dockerode';

import { PassThrough } from 'stream';
import { extractError } from 'serverize/utils';
import tarStream, { type Pack } from 'tar-stream';
import { docker } from './instance';
import { followLogs, removeContainer, startContainer } from './utils';

interface SourceData {
  scope?: string;
  full: string;
  moduleName: string;
  version: string;
  package: string;
  file?: string;
}

const mainOutStream = new PassThrough();
const mainErrStream = new PassThrough();

if (process.env['NODE_ENV'] === 'development') {
  // mainErrStream.setMaxListeners(Infinity);
  // mainOutStream.setMaxListeners(Infinity);
  // mainOutStream.pipe(process.stdout);
  // mainErrStream.pipe(process.stderr);
}
export async function execCommand(
  container: Container,
  cmd: string[],
): Promise<string> {
  const exec = await container.exec({
    AttachStdout: true,
    AttachStderr: true,
    Cmd: cmd,
    Tty: false,
    Privileged: false,
  });
  const stream = await exec.start({});

  const outStream = new PassThrough();
  const errStream = new PassThrough();
  container.modem.demuxStream(stream, outStream, errStream);
  // if (process.env['NODE_ENV'] === 'development') {
  //   outStream.pipe(mainOutStream);
  //   errStream.pipe(mainErrStream);
  // }
  let out = '';
  let err = '';
  outStream.on('data', (chunk) => {
    out += chunk.toString();
  });
  errStream.on('data', (chunk) => {
    err += chunk.toString();
  });

  return new Promise((resolve, reject) => {
    stream.on('end', async () => {
      try {
        console.log(`Command ${cmd.join(' ')}`);
        const a = await exec.inspect();
        if (a.ExitCode !== 0) {
          const error = new Error(err);
          error.cause = a;
          reject(error);
        } else if (err) {
          const error = new Error(err);
          error.cause = a;
          return reject(error);
        } else {
          resolve(out);
        }
      } catch (e) {
        reject(e);
      }
    });
  });
}

export async function getDependencyInstaller() {
  const container = await startContainer('dependency-installer', () =>
    docker.createContainer({
      name: 'dependency-installer',
      Image: 'node:lts',
      WorkingDir: '/app',
      Cmd: ['tail', '-f', '/dev/null'],
      HostConfig: {
        Binds: [`node_modules:/app/node_modules`],
        CapDrop: ['ALL'],
        Privileged: false,
      },
    }),
  );
  await followLogs(container);
  return container;
}

export async function installPackage(sourceData: SourceData) {
  const container = await getDependencyInstaller();
  await execCommand(container, [
    'sh',
    '-c',
    `echo '${JSON.stringify({
      version: '0.0.0',
      main: './build/server.js',
      type: 'module',
      dependencies: {
        'ua-parser-js': '^1.0.37',
        'request-ip': '^3.3.0',
        'rfc-7807-problem-details': '^1.1.0',
        'lodash-es': '^4.17.21',
        hono: '^4.4.0',
        '@hono/node-server': '^1.11.1',
        '@scalar/hono-api-reference': '^0.5.145',
        typeorm: '0.3.20',
        pg: '8.11.5',
        'sql-template-tag': '5.2.1',
        resend: '1.0.0',
        '@octokit/webhooks': '^13.2.7',
        'node-cron': '^3.0.3',
        [sourceData.package]: sourceData.version,
      },
      devDependencies: {
        '@types/ua-parser-js': '^0.7.39',
        '@types/request-ip': '^0.0.41',
        '@types/lodash-es': '^4.17.12',
        '@types/node': '^20.11.26',
        typescript: '^4.9.4',
        '@types/validator': '13.7.17',
        '@types/node-cron': '^3.0.11',
        prettier: '3.3.2',
      },
    })}' > package.json`,
  ]);
  await execCommand(container, [
    'sh',
    '-c',
    'npm install',
    '--no-audit',
    '--no-fund',
  ]);
  return container;
}
export function createPack(content: string) {
  const pack = tarStream.pack();
  const entry = pack.entry({ name: 'package.json' }, content, () => {
    pack.finalize();
  });
  entry.end();
  return new Promise<Pack>((resolve, reject) => {
    entry.on('finish', () => {
      resolve(pack);
    });
    entry.on('error', reject);
  });
}

export async function installPackageJson(content: string, projectId: string) {
  const containerName = `${projectId}-install-deps`;
  const volumeName = 'node_modules';
  const depsImage = 'node:lts-alpine';

  const pack = await createPack(content);
  const [container, error] = await extractError(() =>
    docker.createContainer({
      Image: depsImage,
      WorkingDir: '/app',
      name: containerName,
      Cmd: ['sh', '-c', 'npm install', '--no-audit', '--no-fund'],
      HostConfig: {
        // Binds: [`${volumeName}:/app/node_modules`],
        AutoRemove: true,
        // ReadonlyRootfs: true,
        CapDrop: ['ALL'],
      },
    }),
  );
  if (error) {
    const { statusCode, message } = error as Error & { statusCode: number };

    switch (statusCode) {
      case 409:
        await removeContainer(containerName).catch(() => {
          // noop
        });
        await installPackageJson(content, projectId);
        break;
      case 404:
        console.log(`Image not found: ${depsImage}`);
        console.error(error);
        // FIXME: pull and try again
        break;
      default:
        console.error(error);
        break;
    }
    return;
  }
  try {
    // Copy your package.json into the container
    await container.putArchive(pack as any, {
      path: '/app',
    });
    const stream = await container.attach({
      stream: true,
      stdout: true,
      stderr: true,
      logs: true,
    });
    stream.pipe(process.stdout);
    await container.start();
    await container.wait({
      condition: 'removed',
    });
    console.log('Dependencies installed');
  } finally {
    await removeContainer(containerName).catch(() => {
      // call remove just in case the container didn't remove itself
    });
  }
}

export function createExtract(
  onEntry: (name: string, stream: PassThrough) => void,
) {
  const extract = tarStream.extract();

  extract.on('entry', (header, stream, next) => {
    onEntry(header.name, stream);
    stream.on('end', next);
    stream.resume();
  });

  extract.on('finish', () => {
    console.log('File extraction complete');
  });

  return extract;
}
