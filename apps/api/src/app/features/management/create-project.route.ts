import { Hono } from 'hono';
import z from 'zod';
import policies from '#core/policies.ts';
import { type HonoEnv } from '#core/utils.ts';
import { validate } from '#core/validator.ts';
import Projects from '#entities/projects.entity.ts';
import { consume } from '#extensions/hono/consume.ts';
import output from '#extensions/hono/output.ts';
import { saveEntity } from '#extensions/postgresql/index.ts';
import * as commonZod from '#extensions/zod/index.ts';

export default async function (router: Hono<HonoEnv>) {
  /**
   * @openapi createProject
   * @tags projects
   */
  router.post(
    '/projects',
    policies.authenticated,
    consume('application/json'),
    validate((payload) => ({
      name: { select: payload.body.name, against: commonZod.orgNameValidator },
    })),
    async (context, next) => {
      const signal = context.req.raw.signal;
      const { input, subject } = context.var;
      // FIXME: workspaceId should come from the body
      // user should select in what workspace the project should be created
      // there's no use of it in the claims.
      // IMPORTANT: at the moment project can be created without workspaceId (floating project) must be fixed
      await saveEntity(Projects, {
        name: input.name,
        workspaceId: subject.claims.workspaceId,
      });
      return output.ok();
    },
  );
}
