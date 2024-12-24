import { execSync } from 'child_process';
import { readFile, writeFile } from 'fs/promises';
import path, { join } from 'path';

const npmProjects = ['packages/serverize', 'packages/client', 'apps/vscode'];

execSync('./node_modules/.bin/nx release --skip-publish', {
  stdio: 'inherit',
});
const [releaseTag] = execSync('git tag --sort=-creatordate --list "release/*"')
  .toString()
  .trim()
  .split('\n');

const releaseVersion = releaseTag.replace('release/', '');

for (const project of npmProjects) {
  const dir = path.join(process.cwd(), 'dist', project);
  const packageJson = JSON.parse(
    await readFile(join(dir, 'package.json'), 'utf-8'),
  );
  packageJson.version = releaseVersion;
  await writeFile(
    join(dir, 'package.json'),
    JSON.stringify(packageJson, null, 2),
    'utf-8',
  );
}

/**
 *
 * @param {string} registry
 * @param {string} path
 * @returns {Promise<string>}
 */
async function publishToNpm(registry, path) {
  const withRegistry = registry ? ` --registry=${registry}` : '';
  execSync(`npm publish ${withRegistry}`, {
    cwd: path,
    stdio: 'inherit',
  });
  return releaseVersion;
}

/**
 *
 * @param {string} registry
 * @returns
 */
export default async function publish(registry) {
  for (const project of npmProjects) {
    const dir = path.join(process.cwd(), 'dist', project);
    await publishToNpm(registry, dir).catch((err) => {
      console.error(err);
    });
  }
  return releaseVersion;
}
