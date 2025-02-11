import { type Context } from 'hono';
import { verifyToken } from '#core/identity/subject.ts';
import { HonoEnv } from '#core/utils.ts';

export async function authenticated(
  context: Context<HonoEnv>,
): Promise<boolean> {
  await verifyToken(context.req.header('Authorization'));
  return true;
}
