import { verifyToken } from '@workspace/extensions/identity';
import { type HonoEnv } from '@workspace/utils';
import { type Context } from 'hono';
import z from 'zod';

export async function authenticated(
  context: Context<HonoEnv>,
): Promise<boolean> {
  await verifyToken(context.req.header('Authorization'));
  return true;
}
