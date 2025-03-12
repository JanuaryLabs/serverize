const { execFileSync } = require('node:child_process');
const { esbuildPlugin: january } = require('@januarylabs/canary');
const { hono } = require('@januarylabs/extensions/hono');
const { identity } = require('@januarylabs/extensions/identity');
const { auth } = require('@januarylabs/extensions/firebase');
const { postgresql, typeorm } = require('@januarylabs/extensions/typeorm');
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
