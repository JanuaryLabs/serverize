const { context } = require('esbuild');
const {
  cp,
  copyFile,
  mkdir,
  readFile,
  writeFile,
} = require('node:fs/promises');
const { join } = require('node:path');

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
  name: 'esbuild-problem-matcher',
  setup(build) {
    build.onStart(() => {
      console.log('[watch] build started');
    });
    build.onEnd((result) => {
      result.errors.forEach(({ text, location }) => {
        console.error(`✘ [ERROR] ${text}`);
        console.error(
          `    ${location.file}:${location.line}:${location.column}:`,
        );
      });
      console.log('[watch] build finished');
    });
  },
};
const dest = join(process.cwd(), '../', '../', 'dist/apps/vscode');
async function main() {
  const ctx = await context({
    entryPoints: ['src/index.ts'],
    bundle: true,
    format: 'cjs',
    minify: production,
    sourcemap: !production,
    sourcesContent: false,
    platform: 'node',
    outfile: join(dest, 'index.js'),
    external: ['vscode', 'serverize'],
    logLevel: 'silent',
    plugins: [
      /* add to the end of plugins array */
      esbuildProblemMatcherPlugin,
    ],
  });

  await mkdir(dest, { recursive: true });
  const files = ['package.json', 'CHANGELOG.md'];
  console.log('Copying files', process.cwd(), dest);
  for (const file of files) {
    await copyFile(join(process.cwd(), file), join(dest, file));
  }
  await copyFile(
    join(process.cwd(), '../../', 'README.md'),
    join(dest, 'README.md'),
  );

  const packageJson = JSON.parse(
    await readFile(join(dest, 'package.json'), 'utf-8'),
  );
  packageJson.name = 'serverize';
  await writeFile(
    join(dest, 'package.json'),
    JSON.stringify(packageJson, null, 2),
    'utf-8',
  );

  await cp(join(process.cwd(), 'assets'), join(dest, 'assets'), {
    force: true,
    recursive: true,
  });
  if (watch) {
    await ctx.watch();
  } else {
    await ctx.rebuild();
    await ctx.dispose();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
