import { type HonoEnv } from '@workspace/utils';
import { type Context } from 'hono';
import z from 'zod';

import { ProblemDetailsException } from 'rfc-7807-problem-details';

export async function notImplemented(
  context: Context<HonoEnv>,
): Promise<boolean> {
  throw new ProblemDetailsException({
    title: 'Not implemented',
    detail: 'This feature is not implemented yet',
    status: 501,
  });
}
