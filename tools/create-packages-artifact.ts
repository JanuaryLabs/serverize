import { execSync } from 'child_process';
import { readFile, writeFile } from 'fs/promises';
import path, { join } from 'path';

const npmProjects = ['create'];

execSync('nx release --skip-publish');

const [releaseTag] = execSync('git tag --sort=-creatordate --list "release/*"')
  .toString()
  .trim()
  .split('\n');

const releaseVersion = releaseTag.replace('release/', '');

for (const project of [...npmProjects]) {
  const dir = path.join(process.cwd(), 'dist', 'libs', project);
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

for (const project of npmProjects) {
  const dir = path.join(process.cwd(), 'dist', 'libs', project);
  await publishToNpm(dir).catch((err) => {
    console.error(err);
  });
}

async function publishToNpm(path: string) {
  execSync('npm publish --registry=https://registry.npmjs.org/', {
    cwd: path,
    stdio: 'inherit',
  });
}
