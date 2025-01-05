import { type HonoEnv } from '@workspace/utils';
import { type Context } from 'hono';
import z from 'zod';

export async function adminOnly(context: Context<HonoEnv>): Promise<boolean> {
  if (!context.var.subject) {
    return false;
  }
  return context.var.subject.claims.admin;
}
