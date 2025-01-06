import assert from 'node:assert/strict';
import { test } from 'node:test';
import { nextjs } from './nextjs';

test('NextJS Dockerfile generation', async (t) => {
  await t.test('standalone output mode', () => {
    const result = nextjs({
      output: 'standalone',
      packageManager: 'npm',
    });

    const content = result.print();

    // Base stage
    assert.match(content, /FROM.*node:.*AS base/);
    assert.match(content, /RUN.*apk add.*libc6-compat/);

    // Dependencies stage
    assert.match(content, /COPY package\.json/);
    assert.match(content, /RUN npm ci/);

    // Builder stage
    assert.match(content, /COPY --from=deps \/app\/node_modules/);
    assert.match(content, /RUN npm run build/);

    // Final stage
    assert.match(content, /COPY --from=builder \/app\/\.next\/standalone/);
    assert.match(content, /CMD \["node", "server\.js"\]/);
  });

  await t.test('export output mode', () => {
    const result = nextjs({
      output: 'export',
      packageManager: 'npm',
    });

    const content = result.print();
    assert.match(content, /FROM.*nginx.*AS start/);
    assert.match(content, /COPY --from=builder \/app\/out/);
  });

  await t.test('custom package manager', () => {
    const result = nextjs({
      output: 'standalone',
      packageManager: 'pnpm',
    });

    const content = result.print();
    assert.match(content, /RUN corepack enable pnpm/);
  });
});
