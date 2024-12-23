import { writeFile } from 'fs/promises';
import { join } from 'path';
import { coerceArray } from 'serverize/dockerfile';

export async function writeDockerIgnore(
  projectDir: string,
  dockerignore: string | string[],
) {
  const dockerignorefile = join(projectDir, '.dockerignore');
  await writeFile(
    dockerignorefile,
    coerceArray(dockerignore).join('\n'),
    'utf-8',
  );
  return dockerignorefile;
}
