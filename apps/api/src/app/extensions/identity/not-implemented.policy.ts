import { type Context } from 'hono';
import { ProblemDetailsException } from 'rfc-7807-problem-details';
import { HonoEnv } from '#core/utils.ts';

export async function notImplemented(
  context: Context<HonoEnv>,
): Promise<boolean> {
  throw new ProblemDetailsException({
    title: 'Not implemented',
    detail: 'This feature is not implemented yet',
    status: 501,
  });
}
