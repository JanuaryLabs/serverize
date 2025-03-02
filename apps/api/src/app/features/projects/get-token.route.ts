import { Hono } from 'hono';
import { ProblemDetailsException } from 'rfc-7807-problem-details';
import z from 'zod';
import policies from '#core/policies.ts';
import { type HonoEnv } from '#core/utils.ts';
import { validate } from '#core/validator.ts';
import ApiKeys from '#entities/api-keys.entity.ts';
import { createQueryBuilder, execute } from '#extensions/postgresql/index.ts';
import * as commonZod from '#extensions/zod/index.ts';
import { createOutput } from '#hono';

export default async function (router: Hono<HonoEnv>) {
  router.get(
    '/tokens/:token',
    validate((payload) => ({
      token: { select: payload.params.token, against: z.string() },
    })),
    async (context, next) => {
      const { input } = context.var;
      const output = createOutput(context);
      const qb = createQueryBuilder(ApiKeys, 'apiKeys')
        .andWhere('apiKeys.key = :key', { key: input.token })
        .innerJoinAndSelect('apiKeys.project', 'projects');

      const [token] = await execute(qb);
      if (!token) {
        throw new ProblemDetailsException({
          status: 404,
        });
      }
      return output.ok(token);
    },
  );
}
