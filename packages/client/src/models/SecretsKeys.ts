import { z } from 'zod';

import type { ApiKeys } from './ApiKeys.ts';
import type { Claims } from './Claims.ts';
import type { Members } from './Members.ts';
import type { Organizations } from './Organizations.ts';
import type { OrganizationsMembers } from './OrganizationsMembers.ts';
import type { PaginationMetadata } from './PaginationMetadata.ts';
import type { Preferences } from './Preferences.ts';
import type { Projects } from './Projects.ts';
import type { Releases } from './Releases.ts';
import type { Secrets } from './Secrets.ts';
import type { Snapshots } from './Snapshots.ts';
import type { UnauthorizedErr } from './UnauthorizedErr.ts';
import type { Users } from './Users.ts';
import type { Volumes } from './Volumes.ts';
import type { Workspaces } from './Workspaces.ts';
import type { WorkspacesMembers } from './WorkspacesMembers.ts';

export type SecretsKeys = {
  project: Projects;
  projectId: string;
  key: any;
  id: string;
  createdAt: string;
  updatedAt: string | undefined;
  deletedAt: string | undefined;
};
