import { z } from 'zod';

import type { ApiKeys } from './ApiKeys.ts';
import type { Claims } from './Claims.ts';
import type { Members } from './Members.ts';
import type { Organizations } from './Organizations.ts';
import type { OrganizationsMembers } from './OrganizationsMembers.ts';
import type { PaginationMetadata } from './PaginationMetadata.ts';
import type { Preferences } from './Preferences.ts';
import type { Projects } from './Projects.ts';
import type { Secrets } from './Secrets.ts';
import type { SecretsKeys } from './SecretsKeys.ts';
import type { Snapshots } from './Snapshots.ts';
import type { UnauthorizedErr } from './UnauthorizedErr.ts';
import type { Users } from './Users.ts';
import type { Volumes } from './Volumes.ts';
import type { Workspaces } from './Workspaces.ts';
import type { WorkspacesMembers } from './WorkspacesMembers.ts';

export type Releases = {
  volumes: Volumes[];
  volumesIds: string[];
  serviceName: null | string | undefined;
  containerName: null | string | undefined;
  tarLocation: null | string | undefined;
  domainPrefix: string;
  port: null | number | undefined;
  protocol: null | 'https' | 'tcp' | undefined;
  image: null | string | undefined;
  runtimeConfig: null | string | undefined;
  name: string;
  project: Projects;
  projectId: string;
  channel: 'dev' | 'preview';
  conclusion:
    | null
    | 'processing'
    | 'published'
    | 'success'
    | 'failure'
    | 'cancelled'
    | 'timed_out'
    | undefined;
  status:
    | null
    | 'requested'
    | 'in_progress'
    | 'completed'
    | 'queued'
    | 'waiting'
    | undefined;
  id: string;
  createdAt: string;
  updatedAt: string | undefined;
  deletedAt: string | undefined;
  snapshot: Snapshots;
  snapshotId: string;
};
