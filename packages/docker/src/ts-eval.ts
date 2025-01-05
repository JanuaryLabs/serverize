import Docker, { type Container } from 'dockerode';
import esbuild from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';
import { writeFileSync } from 'fs';
import { tmpdir } from 'os';

import { join } from 'path';
import { createRecorder } from 'serverize/utils';

const docker = new Docker();

const functionList = [
  'project',
  'action',
  'feature',
  'trigger',
  'table',
  'field',
  'unique',
  'mandatory',
  'workflow',
  'QueryFactory',
];

function build(userCode: string) {
  return esbuild.build({
    stdin: {
      contents: `${userCode}`,
      loader: 'ts',
      resolveDir: __dirname,
    },
    inject: [join(__dirname, 'declarative.js')],
    platform: 'node',
    write: false,
    treeShaking: false,
    sourcemap: false,
    minify: false,
    drop: ['debugger', 'console'],
    keepNames: true,
    // dropLabels: [], staticly list all labels
    format: 'cjs',
    bundle: true,
    target: 'es2022',
    plugins: [nodeExternalsPlugin()],
  });
}

async function completeCode(userCode: string) {
  const projectCode = userCode;
  const result = await build(`${projectCode};`);
  return `;${result.outputFiles![0].text};console.log(JSON.stringify(defProject));`;
}

/**
 * Run node.js or typescript untrusted (user) code in a container
 */
export async function runUntrustedCode(userCode: string) {
  if (!userCode) return []; // don't throw error to make the response consistent to avoid threat modeling
  const recorder = createRecorder({ label: 'runUntrustedCode' });
  recorder.record('completeCode');
  const code = await completeCode(userCode);

  const fileName = `${tmpdir()}/user-code-${crypto.randomUUID()}.js`;
  writeFileSync(fileName, code);

  console.log({ fileName });

  recorder.recordEnd('completeCode');
  recorder.record('runContainer');
  const container = await docker.createContainer({
    name: 'untrusted-' + crypto.randomUUID(),
    Image: 'node:lts',
    User: 'node',
    WorkingDir: '/app',
    Env: ['NODE_ENV=production'],
    // Cmd: ['node', 'code.js'],
    Cmd: ['sleep', 'infinity'],
    AttachStdout: true,
    AttachStderr: true,
    OpenStdin: false,
    AttachStdin: false,
    Tty: true,
    NetworkDisabled: true,
    HostConfig: {
      Binds: [
        `${process.cwd()}/node_modules:/app/node_modules`,
        `${fileName}:/app/code.js`,
      ],
      AutoRemove: true,
      ReadonlyPaths: ['/'],
      ReadonlyRootfs: true,
      CapDrop: ['ALL'],
      Memory: 8 * 1024 * 1024,
      UsernsMode: 'host',
      // SecurityOpt: ['no-new-privileges'],
    },
  });
  recorder.recordEnd('runContainer');
  recorder.record('startContainer');
  await container.start();
  recorder.recordEnd('startContainer');

  recorder.record('streamContainerOutput');
  const output = await streamContainerOutput(container);
  recorder.recordEnd('streamContainerOutput');

  recorder.record('wait');
  await container.wait();
  recorder.recordEnd('wait');

  try {
    const def = JSON.parse(output || '[]') as [];
    return def;
  } catch (error) {
    console.log({ output });
    console.error(error);
    return [];
  } finally {
    recorder.end();
    // rmSync(fileName, { force: true, recursive: true });
    // await profile({ label: 'Removeing container' }, () =>
    //   container.remove().catch(() => {
    //     // just in case the container is still running and AutoRemove didn't work
    //   }),
    // );
  }
}

async function streamContainerOutput(container: Container) {
  let output = '';
  const stream = await container.attach({
    stream: true,
    stdout: true,
    stderr: true,
  });

  for await (const chunk of stream) {
    const data = chunk.toString('utf-8');
    output += chunk.toString('utf-8');
  }

  return output;
}
