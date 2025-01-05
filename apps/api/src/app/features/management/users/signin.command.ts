import { Octokit } from '@octokit/core';
import { firebaseApp } from '@workspace/extensions/firebase-auth';
import { createQueryBuilder, execute } from '@workspace/extensions/postgresql';
import {
  AuthClientErrorCode,
  FirebaseAuthError,
  getAuth,
} from 'firebase-admin/auth';
import z from 'zod';

import Preferences from '../preferences.entity.ts';
import { ProblemDetailsException } from 'rfc-7807-problem-details';

import { trigger } from '@january/declarative';

export const signinSchema = z.object({
  token: z.string(),
  providerId: z.enum(['github.com', 'google.com', 'password']),
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
    source: 'vscode',
    ...{
      organizationId: preferences.organizationId,
      workspaceId: preferences.workspaceId,
      projectId: preferences.projectId,
      aknowledged: true,
    },
  });
  return output.ok({
    accessToken: token,
  });
}
