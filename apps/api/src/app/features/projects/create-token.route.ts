import { Hono } from 'hono';
import { ProblemDetailsException } from 'rfc-7807-problem-details';
import z from 'zod';
import policies from '#core/policies.ts';
import { type HonoEnv } from '#core/utils.ts';
import { validate } from '#core/validator.ts';
import ApiKeys from '#entities/api-keys.entity.ts';
import Projects from '#entities/projects.entity.ts';
import { consume } from '#extensions/hono/consume.ts';
import output from '#extensions/hono/output.ts';
import {
  createQueryBuilder,
  execute,
  saveEntity,
} from '#extensions/postgresql/index.ts';
import * as commonZod from '#extensions/zod/index.ts';

export default async function (router: Hono<HonoEnv>) {
  /**
   * @openapi CreateToken
   * @tags tokens
   */
  router.post(
    '/tokens',
    policies.authenticated,
    consume('application/json'),
    validate((payload) => ({
      projectName: {
        select: payload.body.projectName,
        against: commonZod.orgNameValidator,
      },
    })),
    async (context, next) => {
      const signal = context.req.raw.signal;
      const { input } = context.var;
      const qb = createQueryBuilder(Projects, 'projects')
        .where('projects.name = :name', { name: input.projectName })
        .select(['projects.id']);
      const [project] = await execute(qb);
      if (!project) {
        throw new ProblemDetailsException({
          status: 404,
          title: 'Project not found',
          detail: `Project with name '${input.projectName}' not found`,
        });
      }
      const token = crypto.randomUUID().replaceAll('-', '');
      await saveEntity(ApiKeys, {
        key: token,
        projectId: project.id,
      });
      return output.ok(token);
    },
  );
}
