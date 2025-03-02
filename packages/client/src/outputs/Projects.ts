import type { ApiKeys } from './api-keys.ts';
import type { Releases } from './releases.ts';
import type { SecretsKeys } from './secrets-keys.ts';
import type { Secrets } from './secrets.ts';
import type { Workspaces } from './workspaces.ts';
export interface Projects {
  releases: Releases[];
  releasesIds: string[];
  secrets: Secrets[];
  secretsIds: string[];
  secretsKeys: SecretsKeys[];
  secretsKeysIds: string[];
  apiKeys: ApiKeys[];
  apiKeysIds: string[];
  name: string;
  workspace: Workspaces;
  workspaceId: string;
  id: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: Date;
}
