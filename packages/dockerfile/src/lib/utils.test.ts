import assert from 'node:assert/strict';
import { test } from 'node:test';
import { knownPackageManager, packageManagerCommands } from './utils';

test('knownPackageManager function', async (t) => {
  await t.test('should validate known package managers', () => {
    assert.equal(knownPackageManager('npm'), true);
    assert.equal(knownPackageManager('yarn'), true);
    assert.equal(knownPackageManager('pnpm'), true);
  });

  await t.test('should reject unknown package managers', () => {
    assert.equal(knownPackageManager('unknown' as any), false);
    assert.equal(knownPackageManager(undefined), false);
  });
});

test('packageManagerCommands', async (t) => {
  await t.test('npm commands', () => {
    assert.equal(packageManagerCommands.npm.install, 'npm ci');
    assert.equal(packageManagerCommands.npm.devinstall, 'npm i');
    assert.equal(packageManagerCommands.npm.prodinstall, 'npm ci --omit-dev');
    assert.equal(packageManagerCommands.npm.build, 'npm run build');
    assert.deepEqual(packageManagerCommands.npm.lockFile, [
      'package-lock.json*',
    ]);
  });

  await t.test('yarn commands', () => {
    assert.equal(packageManagerCommands.yarn.install, 'yarn --frozen-lockfile');
    assert.equal(packageManagerCommands.yarn.build, 'yarn run build');
    assert.deepEqual(packageManagerCommands.yarn.lockFile, ['yarn.lock']);
  });
});
