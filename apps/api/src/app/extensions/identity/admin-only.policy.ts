import { type Context } from 'hono';
import { HonoEnv } from '#core/utils.ts';

export async function adminOnly(context: Context<HonoEnv>): Promise<boolean> {
  if (!context.var.subject) {
    return false;
  }
  return context.var.subject.claims.admin;
}
