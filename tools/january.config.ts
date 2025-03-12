import { execFileSync } from 'child_process';

import { join } from 'path';

import { defineConfig } from '@januarylabs/canary';
import { auth } from '@januarylabs/extensions/firebase';
import { hono } from '@januarylabs/extensions/hono';
import { identity } from '@januarylabs/extensions/identity';
import { postgresql, typeorm } from '@januarylabs/extensions/typeorm';
import { npmRunPathEnv } from 'npm-run-path';
import { fileWatch } from './file-watcher.ts';

const appDir = join(process.cwd(), 'apps', 'api');
const rootDir = join(process.cwd());

await defineConfig({
  fs: {
    cwd: appDir,
  },
  tsconfigName: join(appDir, 'tsconfig.app.json'),
  extensions: [
    identity,
    hono(),
    auth(),
    fileWatch(),
    typeorm({
      database: postgresql(),
    }),
  ],
});

execFileSync('biome', ['check', 'apps/api/src/app', '--write'], {
  env: npmRunPathEnv(),
  cwd: rootDir,
});
