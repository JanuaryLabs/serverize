import { type trigger } from '@january/declarative';
import { getAuth } from 'firebase-admin/auth';
import { ProblemDetailsException } from 'rfc-7807-problem-details';
import z from 'zod';
import { firebaseApp } from '#extensions/firebase-auth/index.ts';
import {
  createDefaultOrg,
  setUserClaims,
  tellDiscord,
  usersWebhook,
} from '#extensions/user/index.ts';
import * as commonZod from '#extensions/zod/index.ts';
export const createDefaultOrganizationSchema = z.object({
  name: commonZod.orgNameValidator,
  projectName: commonZod.orgNameValidator,
  uid: z.string().trim().min(1),
});

export async function createDefaultOrganization(
  input: z.infer<typeof createDefaultOrganizationSchema>,
  output: trigger.http.output,
  signal: AbortSignal,
) {
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
}
