import { createQueryBuilder, execute } from '@workspace/extensions/postgresql';
import { toTraefikConfig } from '@workspace/extensions/user';
import axios from 'axios';
import z from 'zod';
import Releases from '../../projects/releases.entity.ts';
import { trigger } from '@january/declarative';

export async function getConfig(
  output: trigger.http.output,
  signal: AbortSignal,
) {
  const qb = createQueryBuilder(Releases, 'releases')
    .where('releases.status = :status', { status: 'completed' })
    .andWhere('releases.conclusion = :conclusion', {
      conclusion: 'success',
    });
  const releases = await execute(qb);
  return output.ok(await toTraefikConfig(releases));
}