import { createHash } from 'node:crypto';

import {
  docker,
  ensureDockerRunning,
  followProgress,
  imagesExists,
  isContainerRunning,
} from '@serverize/docker';
import type { Container } from 'dockerode';

import { SandboxError } from '../domain/types.js';
import type { SecurityConfig } from '../security/security-config.js';
import { toDockerContainerConfig } from '../security/security-config.js';

export interface ContainerConfig {
  image: string;
  name?: string;
  securityConfig: SecurityConfig;
  dependencies?: string[];
  verbose?: boolean;
}

export class ContainerManager {
  readonly #verbose: boolean;

  constructor(verbose = false) {
    this.#verbose = verbose;
  }

  #debug(...args: any[]): void {
    if (this.#verbose) {
      console.log('[ContainerManager]', ...args);
    }
  }

  async ensureContainer(config: ContainerConfig): Promise<Container> {
    const containerName = this.#generateContainerName(config);
    return this.#createContainer(config, containerName);
  }

  async #createContainer(
    config: ContainerConfig,
    containerName: string,
  ): Promise<Container> {
    await this.#ensureDocker();

    let imageName = config.image;

    if (config.dependencies && config.dependencies.length > 0) {
      imageName = await this.#ensureImageWithDependencies(
        config.image,
        config.dependencies,
      );
    } else {
      await this.#ensureImage(config.image);
    }

    this.#debug(
      `Creating container: ${containerName} from image: ${imageName}`,
    );

    const dockerConfig = toDockerContainerConfig(config.securityConfig);

    const container = await docker.createContainer({
      Image: imageName,
      name: containerName,
      Tty: false,
      Cmd: ['sh', '-c', 'tail -f /dev/null'],
      OpenStdin: false,
      AttachStdin: false,
      StdinOnce: false,
      AttachStderr: true,
      AttachStdout: true,
      ...dockerConfig,
    });

    this.#debug(`Container created: ${container.id}`);

    await container.start();
    this.#debug(`Container started: ${containerName}`);

    return container;
  }

  async #ensureDocker(): Promise<void> {
    try {
      await ensureDockerRunning();
    } catch (error) {
      throw new SandboxError(
        'Docker daemon is not running. Please start Docker.',
        error instanceof Error ? error : undefined,
      );
    }
  }

  async #ensureImage(imageName: string): Promise<void> {
    const [name, tag = 'latest'] = imageName.split(':');

    if (!(await imagesExists(name, tag))) {
      this.#debug(`Pulling image: ${imageName}`);
      await followProgress(await docker.pull(imageName, {}));
      this.#debug(`Image pulled: ${imageName}`);
    } else {
      this.#debug(`Image exists locally: ${imageName}`);
    }
  }

  async #ensureImageWithDependencies(
    baseImage: string,
    dependencies: string[],
  ): Promise<string> {
    const depsHash = this.#hashDependencies(dependencies);
    const customImageName = `sandbox-${depsHash.slice(0, 12)}`;
    const customImageTag = `deps-${depsHash.slice(0, 8)}`;
    const fullImageName = `${customImageName}:${customImageTag}`;

    if (await imagesExists(customImageName, customImageTag)) {
      this.#debug(`Custom image exists: ${fullImageName}`);
      return fullImageName;
    }

    await this.#ensureImage(baseImage);

    this.#debug(
      `Creating custom image with dependencies: ${dependencies.join(', ')}`,
    );

    const tempContainer = await docker.createContainer({
      Image: baseImage,
      Cmd: ['sh', '-c', `apk add --no-cache ${dependencies.join(' ')}`],
      NetworkDisabled: false,
    });

    try {
      await tempContainer.start();
      await tempContainer.wait();

      await tempContainer.commit({
        repo: customImageName,
        tag: customImageTag,
      });

      this.#debug(`Custom image created: ${fullImageName}`);
      return fullImageName;
    } finally {
      await tempContainer.remove({ force: true }).catch(() => {});
    }
  }

  #generateContainerName(config: ContainerConfig): string {
    if (config.name) {
      return config.name;
    }

    const randomSuffix = Math.random().toString(36).slice(2, 10);
    const imageHash = this.#hashString(config.image).slice(0, 8);

    return `sandbox_${imageHash}_${randomSuffix}`;
  }

  #hashDependencies(dependencies: string[]): string {
    return this.#hashString(dependencies.toSorted().join(','));
  }

  #hashString(input: string): string {
    return createHash('sha256').update(input).digest('hex');
  }

  async destroyContainer(container: Container): Promise<void> {
    try {
      this.#debug(`Stopping container: ${container.id}`);
      await container.stop({ t: 5 }).catch(() => {
        //
      });

      this.#debug(`Removing container: ${container.id}`);
      await container.remove({ force: true });

      this.#debug(`Container destroyed: ${container.id}`);
    } catch (error) {
      throw new SandboxError(
        'Failed to destroy container',
        error instanceof Error ? error : undefined,
      );
    }
  }

  async isRunning(container: Container): Promise<boolean> {
    return isContainerRunning(container);
  }

  async startContainer(container: Container): Promise<void> {
    const running = await this.isRunning(container);
    if (!running) {
      await container.start();
    }
  }
}
