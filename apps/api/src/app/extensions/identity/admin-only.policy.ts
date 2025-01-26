import { type HonoEnv } from '@workspace/utils';
import { type Context } from 'hono';

export async function adminOnly(context: Context<HonoEnv>): Promise<boolean> {
  if (!context.var.subject) {
    return false;
  }
  return context.var.subject.claims.admin;
}
