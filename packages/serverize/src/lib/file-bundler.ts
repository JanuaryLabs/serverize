import esbuild from 'esbuild';

export async function fileBundler(options: { entry: string; out: string }) {
  return esbuild
    .build({
      entryPoints: [options.entry],
      platform: 'node',
      treeShaking: false,
      minify: false,
      keepNames: true,
      minifyIdentifiers: false,
      minifySyntax: false,
      minifyWhitespace: false,
      format: 'esm',
      outfile: options.out,
      bundle: false,
      banner: {
        js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);",
      },
    })
    .then((x) => x.outputFiles?.[0]?.text);
}
