import { ProblemDetailsException } from 'rfc-7807-problem-details';
import z from 'zod';
import { type Context } from 'hono';
import { type HonoEnv } from '@workspace/utils';

export async function notImplemented(
  context: Context<HonoEnv>,
): Promise<boolean> {
  throw new ProblemDetailsException({
    title: 'Not implemented',
    detail: 'This feature is not implemented yet',
    status: 501,
  });
}