import { readFile } from 'node:fs/promises';
import { parse } from 'dotenv';
import { execa } from 'execa';

import { join } from 'path';

export * from './lib/instance';
export * from './lib/npm';
export * from './lib/utils';

export async function isDockerRunning(): Promise<boolean> {
  try {
    await execa({ stdio: 'ignore' })`docker ps`;
    return true;
  } catch {
    return false;
  }
}

export async function ensureDockerRunning(): Promise<void> {
  const isRunning = await isDockerRunning();
  if (!isRunning) {
    throw new Error(`Docker is not running. Please start it then try again.`);
  }
}

export async function mergeEnvs(...files: string[]) {
  const env: Record<string, string> = {};

  for (const file of files) {
    const filePath = join(process.cwd(), file);
    const envFile = await readFile(filePath, 'utf-8');
    const envFileContent = parse(envFile);
    Object.assign(env, envFileContent);
  }
  return env;
}
