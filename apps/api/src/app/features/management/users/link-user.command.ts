import { type trigger } from '@january/declarative';
import { Octokit } from '@octokit/core';
import {
  AuthClientErrorCode,
  FirebaseAuthError,
  getAuth,
} from 'firebase-admin/auth';
import { ProblemDetailsException } from 'rfc-7807-problem-details';
import z from 'zod';
import { firebaseApp } from '#extensions/firebase-auth/index.ts';
import { createDefaultOrg } from '#extensions/user/index.ts';
import { type Claims } from '#extensions/user/index.ts';
import { orgNameValidator } from '#extensions/zod/index.ts';
export const linkUserSchema = z.object({
  token: z.string(),
  providerId: z.enum(['github.com', 'google.com', 'password']),
  orgName: orgNameValidator,
  projectName: orgNameValidator,
});

export async function linkUser(
  input: z.infer<typeof linkUserSchema>,
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
    throw new ProblemDetailsException({
      title: 'User already exists',
      detail: `User with id '${uid}' already exists`,
      status: 409,
    });
  } catch (error) {
    if (error instanceof FirebaseAuthError) {
      if (error.hasCode(AuthClientErrorCode.USER_NOT_FOUND.code)) {
        const newUser = await auth.createUser({
          uid: uid,
          disabled: false,
          displayName: user.name || undefined,
          email: user.email || undefined,
          emailVerified: true,
          photoURL: user.avatar_url || undefined,
        });
        await auth.updateUser(newUser.uid, {
          providerToLink: {
            uid: uid,
            providerId: 'github.com',
            displayName: user.name || undefined,
            email: user.email || undefined,
            photoURL: user.avatar_url || undefined,
          },
        });
        try {
          const data = await createDefaultOrg({
            uid: uid,
            name: input.orgName,
            projectName: input.projectName,
          });
          return output.created({
            accessToken: await auth.createCustomToken(uid, {
              source: 'vscode',
              ...({
                organizationId: data.organizationId,
                workspaceId: data.workspaceId,
                aknowledged: true,
              } satisfies Claims),
            }),
          });
        } catch (error) {
          await auth.deleteUser(uid);
          throw error;
        }
      }
    }
    throw error;
  }
}
