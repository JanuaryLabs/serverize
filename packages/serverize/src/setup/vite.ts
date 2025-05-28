import { detect } from 'detect-package-manager';
import { mkdir, rm } from 'fs/promises';

import { join } from 'path';
import { type PackageManager, vite } from '@serverize/dockerfile';
import { writeDockerIgnore } from '../lib/file';

interface Setup {
  src: string;
  dest: string;
  packageManager?: PackageManager;
  dockerignoreDir?: string;
  buildCommand?: string;
  distDir?: string;
}

export async function setupVite(config: Setup) {
  await mkdir(config.dest, { recursive: true });
  const setup = vite({
    buildCommand: config.buildCommand,
    distDir: config.distDir,
    packageManager:
      config.packageManager || (await detect({ cwd: config.src })),
  });
  const dockerignorefile = await writeDockerIgnore(
    config.dockerignoreDir || config.dest,
    vite.dockerignore,
  );
  const dockerfile = join(config.dest, 'Dockerfile');
  await setup.save(dockerfile);
  return {
    dockerfile,
    cleanup: async () => {
      await rm(dockerfile, { force: true });
      await rm(dockerignorefile, { force: true });
    },
  };
}
