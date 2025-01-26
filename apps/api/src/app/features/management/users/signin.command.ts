import { trigger } from '@january/declarative';
import { Octokit } from '@octokit/core';
import { firebaseApp } from '@workspace/extensions/firebase-auth';
import { createQueryBuilder, execute } from '@workspace/extensions/postgresql';
import { type Claims } from '@workspace/extensions/user';
import {
  AuthClientErrorCode,
  FirebaseAuthError,
  getAuth,
} from 'firebase-admin/auth';
import { ProblemDetailsException } from 'rfc-7807-problem-details';
import z from 'zod';
import Preferences from '../../../entities/preferences.entity.ts';
export const signinSchema = z.object({
  token: z.string(),
  providerId: z.enum(['github.com', 'google.com', 'password']),
  source: z.enum(['vscode', 'api', 'browser']).optional(),
});

export async function signin(
  input: z.infer<typeof signinSchema>,
  output: trigger.http.output,
  signal: AbortSignal,
) {
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
      projectId: preferences.projectId as string,
      aknowledged: true,
    } satisfies Claims),
  });
  return output.ok({
    accessToken: token,
  });
}
