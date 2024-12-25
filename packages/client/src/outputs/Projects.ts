import { Workspaces } from './Workspaces';
import { DateConstructor } from './DateConstructor';
import { Preferences } from './Preferences';
import { Releases } from './Releases';
import { Secrets } from './Secrets';
import { SecretsKeys } from './SecretsKeys';
import { ApiKeys } from './ApiKeys';
export interface Projects {
name: string
workspace: Workspaces
workspaceId: string
id: string
createdAt: Date
updatedAt?: Date
deletedAt?: Date
preferences?: Preferences[]
preferencesIds?: null | string[]
releases: Releases[]
releasesIds: string[]
secrets: Secrets[]
secretsIds: string[]
secretsKeys: SecretsKeys[]
secretsKeysIds: string[]
apiKeys: ApiKeys[]
apiKeysIds: string[]
}
