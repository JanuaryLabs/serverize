import { Hono } from 'hono';
import z from 'zod';
import policies from '#core/policies.ts';
import { type HonoEnv } from '#core/utils.ts';
import { validate } from '#core/validator.ts';
import Projects from '#entities/projects.entity.ts';
import { consume } from '#extensions/hono/consume.ts';
import output from '#extensions/hono/output.ts';
import {
  createQueryBuilder,
  patchEntity,
} from '#extensions/postgresql/index.ts';
import * as commonZod from '#extensions/zod/index.ts';

export default async function (router: Hono<HonoEnv>) {
  router.patch(
    '/projects/:id',
    policies.notImplemented,
    consume('application/json'),
    validate((payload) => ({
      id: { select: payload.params.id, against: z.string().uuid() },
      name: { select: payload.body.name, against: z.string().trim().min(1) },
    })),
    async (context, next) => {
      const { input } = context.var;
      const qb = createQueryBuilder(Projects, 'projects').where(
        'projects.id = :id',
        { id: input.id },
      );
      await patchEntity(qb, {
        name: input.name,
      });
      return output.ok();
    },
  );
}
