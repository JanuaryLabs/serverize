import { createHash } from 'node:crypto';
import { PassThrough } from 'node:stream';

import {
  docker,
  ensureDockerRunning,
  followProgress,
  getContainer,
  imagesExists,
  isContainerRunning,
} from '@serverize/docker';

interface SandboxOptions {
  verbose?: boolean;
  image?: string;
  dependencies?: string[]; // Alpine packages to install (e.g., ['python3', 'nodejs', 'curl'])
}

const languageDependencies: Record<string, string[]> = {};
const languageToImage: Record<string, string> = {
  python: 'python:alpine',
  nodejs: 'node:lts-alpine',
  ruby: 'ruby:lts-alpine',
  go: 'golang:lts-alpine',
};

class CodeRunner {
  #sandbox: Sandbox;
  #packages: string[];

  constructor(sandbox: Sandbox, packages?: string[]) {
    this.#sandbox = sandbox;
    this.#packages = packages || [];
  }

  run(code: string) {
    return this.#sandbox.exec(
      `echo ${JSON.stringify(code)} | python3 -c "import sys; exec(sys.stdin.read())"`,
    );
  }
}

class Sandbox {
  #baseImage: string;
  #verbose: boolean;
  #dependencies: string[];
  #image: string;
  #containerName: string;

  constructor(options: SandboxOptions = {}) {
    this.#baseImage = options.image || 'alpine:latest';
    this.#verbose = options.verbose ?? false;
    this.#dependencies = options.dependencies ?? [];
    this.#image = this.#dependencies.length
      ? `sandbox:${cid(...this.#dependencies).slice(0, 12)}`
      : this.#baseImage;
    // Use a unique container name based on dependencies to allow caching
    this.#containerName = this.#dependencies.length
      ? `sandbox_${cid(this.#baseImage).slice(0, 12)}_${cid(...this.#dependencies).slice(0, 12)}`
      : `sandbox_${cid(this.#baseImage).slice(0, 12)}`;
  }

  #debug(...args: any[]) {
    if (this.#verbose) {
      console.log('[Sandbox]', ...args);
    }
  }

  async #ensureImage() {
    await ensureDockerRunning();
    const [imageName, imageTag] = this.#baseImage.split(':');
    if (!(await imagesExists(imageName, imageTag))) {
      this.#debug(`Image ${this.#baseImage} not found locally. Pulling...`);
      await followProgress(await docker.pull(this.#baseImage, {}));
      this.#debug(`Image ${this.#baseImage} pulled successfully.`);
    } else {
      this.#debug(`Image ${this.#baseImage} found locally.`);
    }
  }

  async #createContainer() {
    await this.#ensureImage();

    // If dependencies are specified, create a custom image with them installed
    if (this.#dependencies.length > 0) {
      await this.#ensureImageWithDependencies();
    }

    this.#debug('Creating sandbox container...');
    const container = await docker.createContainer({
      Image: this.#image,
      name: this.#containerName,
      User: '65534:65534', // nobody:nogroup
      Tty: false,
      Cmd: ['sh', '-c', 'tail -f /dev/null'],
      NetworkDisabled: true,
      OpenStdin: false, // set to true to stream input later
      AttachStdin: false, // set to true to pass input later
      StdinOnce: false, // set to true to close input after one use
      AttachStderr: true, // to read errors
      AttachStdout: true, // to read output
      HostConfig: {
        AutoRemove: false,
        CapDrop: ['ALL'],
        ReadonlyRootfs: true,
        Tmpfs: {
          '/tmp': 'rw,noexec,nosuid,size=64m',
          '/run': 'rw,noexec,nosuid,size=16m',
          '/app': 'rw,noexec,nosuid,size=64m', // enable if you need /app writable without persistence
        },
      },
    });
    return container;
  }

  async #ensureImageWithDependencies() {
    // Create a temporary container to install dependencies
    const tempContainer = await docker.createContainer({
      Image: this.#image,
      Cmd: ['sh', '-c', `apk add --no-cache ${this.#dependencies.join(' ')}`],
      NetworkDisabled: false, // Need network to download packages
    });

    try {
      const [repo, tag] = this.#image.split(':');
      await tempContainer.start();
      await tempContainer.wait();
      await tempContainer.commit({
        repo: repo,
        tag: tag,
      });

      this.#debug(`Custom image created: ${repo}:${tag}`);
    } finally {
      // Clean up temporary container
      await tempContainer.remove({ force: true }).catch(() => {
        // Ignore errors
      });
    }
  }

  async #sandboxContainer() {
    const existingContainer = await getContainer({ name: this.#containerName });
    if (existingContainer) {
      const isRunning = await isContainerRunning(existingContainer);
      if (!isRunning) {
        // If container exists but is not running, check if it's just stopped or exited
        try {
          await existingContainer.start();
          return existingContainer;
        } catch {
          // Container might be in an unrecoverable state, remove and recreate
          this.#debug(
            'Existing container is in bad state, removing and recreate...',
          );
          await existingContainer.remove({ force: true }).catch(() => {
            // Ignore removal errors
          });
          return await this.#createContainer();
        }
      }
      return existingContainer;
    }
    return await this.#createContainer();
  }

  async exec(command: string) {
    const container = await this.#sandboxContainer();
    const isRunning = await isContainerRunning(container);
    if (!isRunning) {
      this.#debug('Sandbox container is not running. Starting...');
      await container.start();
    }
    this.#debug(`Executing command: ${command}`);
    const exec = await container.exec({
      Cmd: ['sh', '-c', command],
      AttachStdout: true,
      AttachStderr: true,
      Privileged: false,
      Tty: false,
    });

    const stream = await exec.start({
      Tty: false,
      stdin: false,
      hijack: false,
      Detach: false,
    });

    const outStream = new PassThrough();
    const errStream = new PassThrough();
    container.modem.demuxStream(stream, outStream, errStream);

    let stdout = '';
    let stderr = '';
    outStream.on('data', (c) => (stdout += c.toString('utf8')));
    errStream.on('data', (c) => (stderr += c.toString('utf8')));

    while (true) {
      const inspectData = await exec.inspect();
      if (!inspectData.Running) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    return { stdout: stdout.trim(), stderr: stderr.trim() };
  }

  async code(config: { language: string; packages?: string[] }) {
    const sandbox = new Sandbox({
      verbose: this.#verbose,
      image: languageToImage[config.language] || this.#baseImage,
      dependencies: languageDependencies[config.language] || [],
    });
    return new CodeRunner(sandbox, config.packages);
  }

  async destroy() {
    const container = await this.#sandboxContainer();
    await container.stop();
    await container.remove({ force: true });
  }
}

function cid(...deps: string[]) {
  return createHash('sha256').update(deps.toSorted().join(',')).digest('hex');
}
