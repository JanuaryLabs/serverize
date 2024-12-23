import type { Plugin } from 'prettier';

export async function formatCode(
  code: string,
  extension?: string,
  ignoreError = true,
): Promise<string> {
  if (!code || code.trim().length === 0) return '';
  function whatIsParserImport(): {
    parserImport: Promise<Plugin>[];
    parserName: string;
  } {
    switch (extension) {
      case 'ts':
        return {
          parserImport: [import('prettier/plugins/typescript')],
          parserName: 'typescript',
        };
      case 'js':
        return {
          parserImport: [import('prettier/plugins/babel')],
          parserName: 'babel',
        };
      case 'html':
        return {
          parserImport: [import('prettier/plugins/html')],
          parserName: 'html',
        };
      case 'css':
        return {
          parserImport: [import('prettier/plugins/postcss')],
          parserName: 'css',
        };
      case 'scss':
        return {
          parserImport: [import('prettier/plugins/postcss')],
          parserName: 'scss',
        };
      case 'code-snippets':
      case 'json':
      case 'prettierrc':
        return {
          parserImport: [import('prettier/plugins/babel')],
          parserName: 'json',
        };
      case 'md':
        return {
          parserImport: [import('prettier/plugins/markdown')],
          parserName: 'markdown',
        };
      case 'yaml':
      case 'yml':
        return {
          parserImport: [import('prettier/plugins/yaml')],
          parserName: 'yaml',
        };
      case '':
      case 'gitignore':
      case 'dockerignore':
      case 'prettierignore':
      case 'Dockerfile':
      case 'toml':
      case 'env':
      case 'txt':
        return {
          parserImport: [],
          parserName: '',
        };
      default:
        return {
          parserImport: [],
          parserName: '',
        };
    }
  }

  const { parserImport, parserName } = whatIsParserImport();
  if (!parserName) return code;
  const [prettier, ...plugins] = await Promise.all([
    import('prettier/standalone'),
    import('prettier/plugins/estree').then((e) => e as any),
    ...parserImport,
  ] as const);

  try {
    return prettier
      .format(code, {
        parser: parserName,
        plugins: plugins,
        singleQuote: true,
      })
      .then((formattedCode) => formattedCode.trim());
  } catch (error) {
    if (error instanceof Error)
      if (error.name === 'SyntaxError') {
        return ignoreError === true ? code : formatCode(code, 'ts', true);
      }
    if (!ignoreError) {
      throw error;
    }
    return code;
  }
}
