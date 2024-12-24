import { Organizations } from './Organizations';
import { DateConstructor } from './DateConstructor';
import { Workspaces } from './Workspaces';
import { Preferences } from './Preferences';
import { Users } from './Users';
import { Members } from './Members';
import { OrganizationsMembers } from './OrganizationsMembers';
import { WorkspacesMembers } from './WorkspacesMembers';
import { Releases } from './Releases';
import { Volumes } from './Volumes';
import { Snapshots } from './Snapshots';
import { Secrets } from './Secrets';
import { SecretsKeys } from './SecretsKeys';
import { ApiKeys } from './ApiKeys';
import { PaginationMetadata } from './PaginationMetadata';
import { Claims } from './Claims';
import { EmptyFavicon } from './EmptyFavicon';
import { SayHi } from './SayHi';
import { HealthCheck } from './HealthCheck';
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
