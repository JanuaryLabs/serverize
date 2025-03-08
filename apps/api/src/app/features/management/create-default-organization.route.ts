import { getAuth } from 'firebase-admin/auth';
import { Hono } from 'hono';
import { ProblemDetailsException } from 'rfc-7807-problem-details';
import z from 'zod';
import policies from '#core/policies.ts';
import { type HonoEnv } from '#core/utils.ts';
import { validate } from '#core/validator.ts';
import { firebaseApp } from '#extensions/firebase-auth/index.ts';
import { consume } from '#extensions/hono/consume.ts';
import output from '#extensions/hono/output.ts';
import {
  createDefaultOrg,
  setUserClaims,
  tellDiscord,
  usersWebhook,
} from '#extensions/user/index.ts';
import * as commonZod from '#extensions/zod/index.ts';

export default async function (router: Hono<HonoEnv>) {
  /**
   * @openapi createDefaultOrganization
   * @tags organizations
   */
  router.post(
    '/organizations/default',
    consume('application/json'),
    validate((payload) => ({
      name: { select: payload.body.name, against: commonZod.orgNameValidator },
      projectName: {
        select: payload.body.projectName,
        against: commonZod.orgNameValidator,
      },
      uid: { select: payload.body.uid, against: z.string().trim().min(1) },
    })),
    async (context, next) => {
      const { input } = context.var;
      try {
        const data = await createDefaultOrg({
          uid: input.uid,
          name: input.name,
          projectName: input.projectName,
        });

        const firebaseUser = await getAuth(firebaseApp)
          .getUser(input.uid)
          .catch((error) => {
            if (process.env.NODE_ENV === 'development') {
              console.error(error);
            }
            // noop
          });
        if (firebaseUser) {
          await tellDiscord(
            `New user "${firebaseUser.email}" join.`,
            usersWebhook,
          ).catch((error) => {
            if (process.env.NODE_ENV === 'development') {
              console.error(error);
            }
            // noop
          });
        }

        const claims = await setUserClaims({
          uid: input.uid,
          organizationId: data.organizationId,
          workspaceId: data.workspaceId,
        });

        return output.ok(claims);
      } catch (error) {
        if (error instanceof ProblemDetailsException) {
          if (error.Details.detail === 'SQLITE_CONSTRAINT_UNIQUE') {
            error.Details.title = 'Organization already exists';
            error.Details.detail = `Organization with name '${input.name}' already exists`;
            throw error;
          }
        }
        throw error;
      }
    },
  );
}
