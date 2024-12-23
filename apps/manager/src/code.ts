import { Mutex } from 'async-mutex';
import { existsSync } from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import { dirname, join } from 'path';

import { bundle } from '@january/bundler';

import { fileChanged } from 'serverize/docker';
import { createRecorder } from 'serverize/utils';

import { makeProjectPath } from './manager';

const bootMap = new Map<string, Mutex>();
const intermidateMutexes = new Map<string, Mutex>();

export async function writeProject(projectId: string) {
  let intermidateX = intermidateMutexes.get(projectId);
  if (!intermidateX) {
    intermidateMutexes.set(projectId, new Mutex());
  }
  intermidateX ??= intermidateMutexes.get(projectId) as Mutex;
  const intermidateXRelease = await intermidateX.acquire();
  try {
    const repoPath = makeProjectPath(projectId);
    const files = [] as { content: string; path: string }[];
    const sourceCode = await writeSourceCode(repoPath, files);
    if (!sourceCode) {
      return null;
    }
    const changeResult = await fileChanged(sourceCode.mainFile, projectId);
    console.log({
      repoPath,
      codeChanged: changeResult.changed,
    });
    return {
      changeResult,
      repoPath,
      files,
    };
  } finally {
    intermidateXRelease();
  }
}

export async function writeSourceCode(
  repoPath: string,
  files: { path: string; content: string }[],
) {
  const recorder = createRecorder({
    label: 'getDist',
  });
  recorder.record('write');

  if (!files.length) {
    throw new Error('No files to write');
  }

  for (const file of files) {
    await mkdir(dirname(join(repoPath, file.path)), { recursive: true });
    await writeFile(join(repoPath, file.path), file.content, 'utf-8');
    console.log('write', file.path);
  }
  recorder.recordEnd('write');

  if (!existsSync(join(repoPath, 'src', 'server.ts'))) {
    console.warn('No server.ts file found');
    return null;
  }
  recorder.record('bundle');
  const bundlePath = join(repoPath, 'build', 'server.js');
  await bundle({
    projectRoot: repoPath,
    entry: join(repoPath, 'src', 'server.ts'),
    out: bundlePath,
  });
  recorder.recordEnd('bundle');
  return {
    mainFile: bundlePath,
  };
}
