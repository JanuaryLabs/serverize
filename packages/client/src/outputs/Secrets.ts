import { Organizations } from './Organizations';
import { DateConstructor } from './DateConstructor';
import { Workspaces } from './Workspaces';
import { Projects } from './Projects';
import { Preferences } from './Preferences';
import { Users } from './Users';
import { Members } from './Members';
import { OrganizationsMembers } from './OrganizationsMembers';
import { WorkspacesMembers } from './WorkspacesMembers';
import { Releases } from './Releases';
import { Volumes } from './Volumes';
import { Snapshots } from './Snapshots';
import { Uint8ArrayConstructor } from './Uint8ArrayConstructor';
import { SecretsKeys } from './SecretsKeys';
import { ApiKeys } from './ApiKeys';
import { PaginationMetadata } from './PaginationMetadata';
import { Claims } from './Claims';
import { EmptyFavicon } from './EmptyFavicon';
import { SayHi } from './SayHi';
import { HealthCheck } from './HealthCheck';
export interface Secrets {
project: Projects
projectId: string
label: string
channel?: null | "dev" | "preview"
nonce: Uint8ArrayConstructor
secret: Uint8ArrayConstructor
id: string
createdAt: Date
updatedAt?: Date
deletedAt?: Date
}
