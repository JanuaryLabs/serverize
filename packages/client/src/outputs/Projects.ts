import { ApiKeys } from './ApiKeys';
import { Preferences } from './Preferences';
import { Releases } from './Releases';
import { Secrets } from './Secrets';
import { SecretsKeys } from './SecretsKeys';
import { Workspaces } from './Workspaces';
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
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  preferences?: Preferences[];
  preferencesIds?: null | string[];
}
