const { execFileSync } = require('node:child_process');
const { esbuildPlugin: january } = require('@january/canary');
const { hono } = require('@january/extensions/hono');
const { identity } = require('@january/extensions/identity');
const { auth } = require('@january/extensions/firebase');
const { postgresql, typeorm } = require('@january/extensions/typeorm');
const { npmRunPathEnv } = require('npm-run-path');
const { join } = require('node:path');
// const { fileWatch } = require(join(process.cwd(), 'tools/file-watcher.ts'));
const appDir = join(process.cwd(), 'apps', 'api');

module.exports = {
  packages: 'external',
  alias: {
    lodash: 'lodash-es',
  },
  banner: {
    js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
  },
  plugins: [
    january({
      fs: {
        cwd: appDir,
      },
      extensions: [
        identity,
        hono(),
        auth(),
        // fileWatch(),
        typeorm({
          database: postgresql(),
        }),
      ],
      formatter: () => {
        execFileSync('biome', ['check', 'src/app', '--write'], {
          env: npmRunPathEnv(),
          cwd: appDir,
        });
      },
    }),
  ],
};
