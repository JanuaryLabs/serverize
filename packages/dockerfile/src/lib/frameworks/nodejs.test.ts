import assert from 'node:assert/strict';
import { test } from 'node:test';
import { nodejs } from './node';

test('NodeJS Dockerfile generation', async (t) => {
  await t.test('basic configuration', () => {
    const result = nodejs({
      entrypoint: 'index.js',
      port: 3000,
    });

    const content = result.print();

    // Base image
    assert.match(content, /FROM.*node:.*AS base/);

    // Dependencies
    assert.match(content, /COPY package\.json/);
    assert.match(content, /RUN .*(npm ci|yarn install|pnpm i)/);

    // Final stage
    assert.match(content, /EXPOSE 3000/);
    assert.match(content, /CMD \["node", "index\.js"\]/);
  });

  await t.test('with build command', () => {
    const result = nodejs({
      entrypoint: 'dist/index.js',
      buildCommand: 'npm run build',
      packageManager: 'npm',
    });

    const content = result.print();
    assert.match(content, /RUN npm run build/);
    assert.match(content, /CMD \["node", "dist\/index\.js"\]/);
  });

  await t.test('custom node version', () => {
    const result = nodejs({
      entrypoint: 'index.js',
      version: '18-alpine',
    });

    const content = result.print();
    assert.match(content, /FROM.*node:18-alpine/);
  });
});
