import { verifyToken } from '@workspace/extensions/identity';
import z from 'zod';
import { type Context } from 'hono';
import { type HonoEnv } from '@workspace/utils';

export async function authenticated(
  context: Context<HonoEnv>,
): Promise<boolean> {
  await verifyToken(context.req.header('Authorization'));
  return true;
}