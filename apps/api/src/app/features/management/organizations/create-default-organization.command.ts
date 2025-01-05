import { firebaseApp } from '@workspace/extensions/firebase-auth';
import {
  createDefaultOrg,
  setUserClaims,
  tellDiscord,
} from '@workspace/extensions/user';
import { orgNameValidator } from '@workspace/extensions/zod';
import { getAuth } from 'firebase-admin/auth';
import z from 'zod';

import { ProblemDetailsException } from 'rfc-7807-problem-details';

import { trigger } from '@january/declarative';

export const createDefaultOrganizationSchema = z.object({
  name: orgNameValidator,
  projectName: orgNameValidator,
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
      await tellDiscord(`New user "${firebaseUser.email}" join.`).catch(
        (error) => {
          if (process.env.NODE_ENV === 'development') {
            console.error(error);
          }
          // noop
        },
      );
    }

    const claims = await setUserClaims({
      uid: input.uid,
      organizationId: data.organizationId,
      workspaceId: data.workspaceId,
      projectId: data.projectId,
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
