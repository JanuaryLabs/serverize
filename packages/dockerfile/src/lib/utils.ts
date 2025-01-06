import type { Stage } from './docker_file';

export type PackageManager = 'yarn' | 'npm' | 'pnpm' | 'bun';

/**
 * Checks if the user specified package manager is known
 * @param userSepcified The user specified package manager
 * @returns True if the user specified package manager is known, false otherwise
 */
export function knownPackageManager(
  userSepcified?: PackageManager,
): userSepcified is PackageManager {
  if (!userSepcified) {
    return false;
  }
  return ['yarn', 'npm', 'pnpm'].includes(userSepcified);
}
/**
 * Returns the commands to install and build a project using the specified package manager
 */
export const packageManagerCommands = {
  npm: {
    install: 'npm i',
    devinstall: 'npm i',
    prodinstall: 'npm i --omit-dev',
    build: 'npm run build',
    lockFile: ['package-lock.json*'],
  },
  yarn: {
    prodinstall: 'yarn --frozen-lockfile --production=true',
    devinstall: 'yarn --frozen-lockfile --production=false',
    install: 'yarn --frozen-lockfile',
    build: 'yarn run build',
    lockFile: ['yarn.lock'],
  },
  pnpm: {
    prodinstall: 'corepack enable pnpm && pnpm i --frozen-lockfile --prod',
    devinstall: 'corepack enable pnpm && pnpm i --frozen-lockfile',
    install: 'corepack enable pnpm && pnpm i --frozen-lockfile',
    build: 'corepack enable pnpm && pnpm run build',
    lockFile: ['pnpm-lock.yaml'],
  },
  bun: {
    prodinstall: 'bun install --frozen-lockfile --prod',
    devinstall: 'bun install --frozen-lockfile',
    install: 'bun install --frozen-lockfile',
    build: 'bun run build',
    lockFile: ['bun.lock*'],
  },
};

/**
 * Guesses the package manager based on the project's lock file
 */
export const guessPackageManager = {
  build: [
    'if [ -f yarn.lock ]; then yarn run build;',
    'elif [ -f package-lock.json ]; then npm run build;',
    'elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build;',
    'else echo "Lockfile not found." && exit 1;',
    'fi',
  ],
  install: [
    'if [ -f yarn.lock ]; then yarn --frozen-lockfile;',
    'elif [ -f package-lock.json ]; then npm i;',
    'elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile;',
    'else echo "Lockfile not found." && exit 1;',
    'fi',
  ],
  lockFile: [
    'package.json',
    'yarn.lock*',
    'package-lock.json*',
    'pnpm-lock.yaml*',
  ],
};

/**
 * Factory function to create a stage
 * @param stageConfig
 * @param options
 *
 * @example
 * {
 *   build: stage(build, {packageManager: 'npm'}),
 * }
 */
export function stage<P>(
  stageConfig: Stage | ((options: P) => Stage),
  options?: P,
) {
  if (options) {
    return [stageConfig, options] as const;
  }
  return [stageConfig] as const;
}
