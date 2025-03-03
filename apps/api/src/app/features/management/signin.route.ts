import { Octokit } from '@octokit/core';
import {
  AuthClientErrorCode,
  FirebaseAuthError,
  getAuth,
} from 'firebase-admin/auth';
import { Hono } from 'hono';
import { ProblemDetailsException } from 'rfc-7807-problem-details';
import z from 'zod';
import policies from '#core/policies.ts';
import { type HonoEnv } from '#core/utils.ts';
import { validate } from '#core/validator.ts';
import Preferences from '#entities/preferences.entity.ts';
import { firebaseApp } from '#extensions/firebase-auth/index.ts';
import { consume } from '#extensions/hono/consume.ts';
import output from '#extensions/hono/output.ts';
import { createQueryBuilder, execute } from '#extensions/postgresql/index.ts';
import { type Claims } from '#extensions/user/index.ts';
import * as commonZod from '#extensions/zod/index.ts';

export default async function (router: Hono<HonoEnv>) {
  router.post(
    '/users/signin',
    consume('application/json'),
    validate((payload) => ({
      token: { select: payload.body.token, against: z.string() },
      providerId: {
        select: payload.body.providerId,
        against: z.enum(['github.com', 'google.com', 'password']),
      },
      source: {
        select: payload.body.source,
        against: z.enum(['vscode', 'api', 'browser']).optional(),
      },
    })),
    async (context, next) => {
      const { input } = context.var;
      const auth = getAuth(firebaseApp);
      const octokit = new Octokit({
        auth: input.token,
      });
      const { data: user } = await octokit.request('GET /user');
      const uid = String(user.id);
      try {
        await auth.getUser(uid);
      } catch (error) {
        if (error instanceof FirebaseAuthError) {
          if (error.hasCode(AuthClientErrorCode.USER_NOT_FOUND.code)) {
            throw new ProblemDetailsException({
              title: 'User not found',
              detail: `User with id '${uid}' not found`,
              status: 404,
              code: 'auth/user-not-found',
            });
          }
        }
        throw error;
      }
      const [preferences] = await execute(
        createQueryBuilder(Preferences, 'preferences').where(
          'preferences.userId = :uid',
          { uid },
        ),
      );
      console.log(uid, preferences);
      const token = await auth.createCustomToken(uid, {
        source: input.source,
        ...({
          organizationId: preferences.organizationId as string,
          workspaceId: preferences.workspaceId as string,
          aknowledged: true,
        } satisfies Claims),
      });
      return output.ok({
        accessToken: token,
      });
    },
  );
}
