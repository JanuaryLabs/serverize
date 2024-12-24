import { Organizations } from './Organizations';
import { DateConstructor } from './DateConstructor';
import { Workspaces } from './Workspaces';
import { Projects } from './Projects';
import { Preferences } from './Preferences';
import { Users } from './Users';
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
export interface Members {
user?: Users
userId?: null | string
organization?: Organizations
organizationId?: null | string
id: string
createdAt: Date
updatedAt?: Date
deletedAt?: Date
organizationsMembers?: OrganizationsMembers[]
organizationsMembersIds?: null | string[]
workspacesMembers?: WorkspacesMembers[]
workspacesMembersIds?: null | string[]
}
