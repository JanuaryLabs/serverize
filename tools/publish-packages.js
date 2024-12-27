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
  const distDir = path.join(process.cwd(), 'dist', project);
  const packagesDir = path.join(process.cwd(), project);
  const projectJson = JSON.parse(
    await readFile(join(packagesDir, 'project.json'), 'utf-8'),
  );
  const packageJson = JSON.parse(
    await readFile(join(distDir, 'package.json'), 'utf-8'),
  );

  /**
   * @type {string[]}
   */
  const external =
    projectJson?.targets?.build?.configurations?.production?.external ?? [];
  external
    .filter((external) => external.startsWith('@serverize'))
    .forEach((external) => {
      packageJson.dependencies[external] = releaseVersion;
    });
  packageJson.version = releaseVersion;
  await writeFile(
    join(distDir, 'package.json'),
    JSON.stringify(packageJson, null, 2),
    'utf-8',
  );
  console.log(`Updated ${project} ${join(distDir, 'package.json')}`);
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
