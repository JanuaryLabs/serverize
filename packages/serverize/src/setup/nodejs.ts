import { input } from '@inquirer/prompts';
import { detect } from 'detect-package-manager';
import { rm } from 'fs/promises';

import { writeDockerIgnore } from '../lib/file';
import { spinner } from '../program';
import { join } from 'path';
import semver from 'semver';
import { type PackageManager, nodejs } from 'serverize/dockerfile';
import { type PackageJson, getFile, readPackageJson } from 'serverize/utils';

interface Setup {
  cwd: string;
  src: string;
  dest: string;

  packageManager?: PackageManager;
  dockerignoreDir?: string;
  buildCommand?: string;
  distDir?: string;
  entrypoint?: string;
  bundle?: boolean;
}

export async function getNodejsVersion(packageJsonPath: string | PackageJson) {
  const packageJsonContent =
    typeof packageJsonPath !== 'string'
      ? packageJsonPath
      : await readPackageJson(
          packageJsonPath.endsWith('package.json')
            ? packageJsonPath
            : join(packageJsonPath, 'package.json'),
        ).then((it) => it.content);

  const version = semver.coerce(packageJsonContent.engines?.node);
  if (!version) {
    return null;
  }
  return {
    major: version?.major,
    alpine: version?.major ? `${version.major}-alpine` : undefined,
  };
}

export async function setupNodejs(config: Setup) {
  const { content } = await readPackageJson(config.cwd);
  const tsconfig = await getFile(join(config.src, 'tsconfig.json'));
  const buildCommand = config.buildCommand || content.scripts?.build;
  if (tsconfig && !buildCommand) {
    spinner.fail(
      `Could not find a build script in package.json. Please add a build script to your package.json`,
    );
    process.exit(1);
  }
  const entrypoint =
    config.entrypoint ||
    content.main ||
    (await input({
      message: 'Entrypoint (relative to the project root)',
      default: './index.js',
    }));
  const userNodeVersion = await getNodejsVersion(content);
  if (userNodeVersion) {
    spinner.info(`Using Node.js version ${userNodeVersion}`);
  } else {
    spinner.info(`Using LTS Node.js version`);
  }

  const setup = nodejs({
    buildCommand: buildCommand,
    entrypoint: entrypoint,
    distDir: config.distDir,
    packageManager:
      config.packageManager || (await detect({ cwd: config.src })),
    version: userNodeVersion?.alpine,
    bundle: config.bundle,
  });
  const dockerignorefile = await writeDockerIgnore(
    config.dockerignoreDir || config.dest,
    nodejs.dockerignore,
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
