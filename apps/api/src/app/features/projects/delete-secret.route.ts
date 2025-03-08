import { Hono } from 'hono';
import z from 'zod';
import policies from '#core/policies.ts';
import { type HonoEnv } from '#core/utils.ts';
import { validate } from '#core/validator.ts';
import Secrets from '#entities/secrets.entity.ts';
import output from '#extensions/hono/output.ts';
import {
  createQueryBuilder,
  removeEntity,
} from '#extensions/postgresql/index.ts';
import * as commonZod from '#extensions/zod/index.ts';

export default async function (router: Hono<HonoEnv>) {
  /**
   * @openapi DeleteSecret
   * @tags secrets
   */
  router.delete(
    '/secrets/:id',
    validate((payload) => ({
      id: { select: payload.params.id, against: z.string().uuid() },
    })),
    async (context, next) => {
      const { input } = context.var;
      const qb = createQueryBuilder(Secrets, 'secrets').where(
        'secrets.id = :id',
        { id: input.id },
      );
      await removeEntity(Secrets, qb);
      return output.ok();
    },
  );
}
