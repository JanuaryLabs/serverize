import { getAuth } from 'firebase-admin/auth';
import { Hono } from 'hono';
import { ProblemDetailsException } from 'rfc-7807-problem-details';
import z from 'zod';
import policies from '#core/policies.ts';
import { type HonoEnv } from '#core/utils.ts';
import { validate } from '#core/validator.ts';
import ApiKeys from '#entities/api-keys.entity.ts';
import { firebaseApp } from '#extensions/firebase-auth/index.ts';
import { consume } from '#extensions/hono/consume.ts';
import output from '#extensions/hono/output.ts';
import { createQueryBuilder, execute } from '#extensions/postgresql/index.ts';
import * as commonZod from '#extensions/zod/index.ts';

export default async function (router: Hono<HonoEnv>) {
  router.post(
    '/tokens/exchange',
    consume('application/json'),
    validate((payload) => ({
      token: { select: payload.body.token, against: z.string() },
    })),
    async (context, next) => {
      const { input } = context.var;
      const qb = createQueryBuilder(ApiKeys, 'apiKeys')
        .where('apiKeys.key = :key', { key: input.token })
        .innerJoinAndSelect('apiKeys.project', 'projects')
        .innerJoinAndSelect('projects.workspace', 'workspace');

      const [apiKey] = await execute(qb);
      if (!apiKey) {
        throw new ProblemDetailsException({
          status: 401,
          title: 'Invalid API token',
          detail: 'The provided API token is invalid or has been revoked',
        });
      }

      const auth = getAuth(firebaseApp);
      const customToken = await auth.createCustomToken(crypto.randomUUID(), {
        source: 'api',
        organizationId: apiKey.project.workspace.organizationId,
        workspaceId: apiKey.project.workspaceId,
        projectId: apiKey.projectId,
        aknowledged: true,
      });
      return output.ok({ accessToken: customToken });
    },
  );
}
