import { execSync } from 'child_process';
import { readFile, writeFile } from 'fs/promises';
import path, { join } from 'path';

import publishToNpm from './publish-packages';

const releaseVersion = await publishToNpm('https://registry.npmjs.org/');

const vscodeExtDistPath = join(process.cwd(), 'dist/apps/vscode');
const packageJson = JSON.parse(
  await readFile(join(vscodeExtDistPath, 'package.json'), 'utf-8'),
);
packageJson.name = 'serverize';
await writeFile(
  join(vscodeExtDistPath, 'package.json'),
  JSON.stringify(packageJson, null, 2),
  'utf-8',
);

execSync('npx vsce publish', {
  stdio: 'inherit',
  cwd: vscodeExtDistPath,
});
