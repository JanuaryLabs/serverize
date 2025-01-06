import assert from 'node:assert/strict';
import { test } from 'node:test';
import { dockerfile } from './docker_file';

test('dockerfile generation', async (t) => {
  await t.test('should generate basic dockerfile', () => {
    const result = dockerfile({
      start: {
        from: 'node:18-alpine',
        workdir: '/app',
        cmd: 'node index.js',
        port: 3000,
      },
    });

    const content = result.print();
    assert.match(content, /FROM node:18-alpine AS start/);
    assert.match(content, /WORKDIR \/app/);
    assert.match(content, /CMD \["node", "index.js"\]/);
    assert.match(content, /EXPOSE 3000/);
  });

  await t.test('should handle multi-stage builds', () => {
    const result = dockerfile({
      stages: {
        builder: {
          from: 'node:18-alpine',
          workdir: '/build',
          run: 'npm run build',
        },
      },
      start: {
        from: 'nginx:alpine',
        port: 80,
        cmd: 'nginx -g "daemon off;"',
      },
    });

    const content = result.print();
    assert.match(content, /FROM node:18-alpine AS builder/);
    assert.match(content, /FROM nginx:alpine AS start/);
  });
});
