import assert from 'node:assert/strict';
import { test } from 'node:test';
import { bunServer, denoServer, nodeServer } from './servers';

test('server configurations', async (t) => {
  await t.test('nodeServer', async (t) => {
    await t.test('should configure with string input', () => {
      const config = nodeServer('app.js');
      assert.equal(config.cmd, 'node app.js');
      assert.equal(config.port, 3000);
      assert.equal(config.user, 'node');
    });

    await t.test('should configure with object input', () => {
      const config = nodeServer({
        from: 'node:alpine',
        entry: 'app.js',
        port: 8080,
      });
      assert.deepEqual(config.cmd, ['node', 'app.js']);
      assert.equal(config.port, 8080);
    });
  });

  await t.test('denoServer', async (t) => {
    await t.test('should include deno permissions', () => {
      const config = denoServer('app.ts');
      assert.deepEqual(config.cmd, ['deno', '--allow-net', 'app.ts']);
      assert.equal(config.port, 8000);
    });
  });

  await t.test('bunServer', async (t) => {
    await t.test('should configure bun runtime', () => {
      const config = bunServer('index.ts');
      assert.equal(config.cmd, 'bun index.ts');
      assert.equal(config.port, 3000);
      assert.equal(config.user, 'bun');
    });
  });
});
