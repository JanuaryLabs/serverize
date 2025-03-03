import { Hono } from 'hono';
import z from 'zod';
import policies from '#core/policies.ts';
import { type HonoEnv } from '#core/utils.ts';
import { validate } from '#core/validator.ts';
import Organizations from '#entities/organizations.entity.ts';
import output from '#extensions/hono/output.ts';
import {
  createQueryBuilder,
  removeEntity,
} from '#extensions/postgresql/index.ts';
import * as commonZod from '#extensions/zod/index.ts';

export default async function (router: Hono<HonoEnv>) {
  router.delete(
    '/organizations/:id',
    policies.adminOnly,
    validate((payload) => ({
      id: { select: payload.params.id, against: z.string().uuid() },
    })),
    async (context, next) => {
      const { input } = context.var;
      const qb = createQueryBuilder(Organizations, 'organizations').where(
        'organizations.id = :id',
        { id: input.id },
      );
      await removeEntity(Organizations, qb);
      return output.ok();
    },
  );
}
