import z from 'zod';
import { type Context } from 'hono';
import { type HonoEnv } from '@workspace/utils';

export async function adminOnly(context: Context<HonoEnv>): Promise<boolean> {
  if (!context.var.subject) {
    return false;
  }
  return context.var.subject.claims.admin;
}