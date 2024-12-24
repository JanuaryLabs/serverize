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
import { Secrets } from './Secrets';
import { Uint8ArrayConstructor } from './Uint8ArrayConstructor';
import { ApiKeys } from './ApiKeys';
import { PaginationMetadata } from './PaginationMetadata';
import { Claims } from './Claims';
import { EmptyFavicon } from './EmptyFavicon';
import { SayHi } from './SayHi';
import { HealthCheck } from './HealthCheck';
export interface SecretsKeys {project: Projects
projectId: string
key: Uint8ArrayConstructor
id: string
createdAt: Date
updatedAt?: Date
deletedAt?: Date}