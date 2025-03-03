import { Hono } from 'hono';
import { ProblemDetailsException } from 'rfc-7807-problem-details';
import z from 'zod';
import policies from '#core/policies.ts';
import { type HonoEnv } from '#core/utils.ts';
import { validate } from '#core/validator.ts';
import ApiKeys from '#entities/api-keys.entity.ts';
import Projects from '#entities/projects.entity.ts';
import output from '#extensions/hono/output.ts';
import { createQueryBuilder, execute } from '#extensions/postgresql/index.ts';
import * as commonZod from '#extensions/zod/index.ts';

export default async function (router: Hono<HonoEnv>) {
  router.get(
    '/tokens',
    policies.authenticated,
    validate((payload) => ({
      projectName: { select: payload.query.projectName, against: z.string() },
    })),
    async (context, next) => {
      const { input } = context.var;
      const projectQb = createQueryBuilder(Projects, 'projects')
        .where('projects.name = :name', { name: input.projectName })
        .select(['projects.id']);
      const [project] = await execute(projectQb);
      if (!project) {
        throw new ProblemDetailsException({
          status: 404,
          title: 'Project not found',
          detail: `Project with name '${input.projectName}' not found`,
        });
      }
      const qb = createQueryBuilder(ApiKeys, 'apiKeys')
        .where('apiKeys.projectId = :projectId', {
          projectId: project.id,
        })
        .innerJoinAndSelect('apiKeys.project', 'projects');

      const records = await execute(qb);
      return output.ok(records);
    },
  );
}
