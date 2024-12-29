import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join } from 'path';

import { formatCode } from './format-code';
import { getExt } from './utils';

export interface PackageJson {
  name: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
  scripts: Record<string, string>;
  type?: string;
  types?: string;
  typings?: string;
  version: string;
  main?: string;
  files?: string[];
  engines?: {
    node?: string;
  };
  exports: Record<
    string,
    {
      types: string;
    }
  >;
}

export async function writeFiles(
  dir: string,
  contents: Record<string, unknown>,
  format = true,
) {
  for (const [file, content] of Object.entries(contents)) {
    const filePath = isAbsolute(file) ? file : join(dir, file);
    await mkdir(dirname(filePath), { recursive: true });
    const stringContent =
      typeof content === 'string' ? content : JSON.stringify(content);

    await writeFile(
      filePath,
      format ? await formatCode(stringContent, getExt(file)) : stringContent,
      'utf-8',
    );
  }
}

export async function readFolder(path: string) {
  if (await exist(path)) {
    return readdir(path);
  }
  return [] as string[];
}

export async function readPackageJson(dir: string) {
  const packageJsonPath = join(dir, 'package.json');
  const content = JSON.parse(
    await readFile(packageJsonPath, 'utf-8'),
  ) as PackageJson;
  return {
    content,
    write: (value: PackageJson = content) =>
      writeFile(packageJsonPath, JSON.stringify(value, null, 2), 'utf-8'),
  };
}
export async function exist(file: string): Promise<boolean> {
  return stat(file)
    .then(() => true)
    .catch(() => false);
}

export async function getFile(filePath: string) {
  if (await exist(filePath)) {
    return readFile(filePath, 'utf-8');
  }
  return null;
}

export async function readJsonFile(filePath: string) {
  const file = await getFile(filePath);
  return file ? (JSON.parse(file) as Record<string, any>) : null;
}
