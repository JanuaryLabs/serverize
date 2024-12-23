import { Organizations } from './Organizations';
import { DateConstructor } from './DateConstructor';
import { Workspaces } from './Workspaces';
import { Projects } from './Projects';
import { Preferences } from './Preferences';
import { Users } from './Users';
import { Members } from './Members';
import { OrganizationsMembers } from './OrganizationsMembers';
import { WorkspacesMembers } from './WorkspacesMembers';
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
export interface Releases {
volumes: Volumes[]
volumesIds: string[]
serviceName?: null | string
containerName?: null | string
tarLocation?: null | string
domainPrefix: string
port?: null | number
image?: null | string
runtimeConfig?: null | string
name: string
project: Projects
projectId: string
channel: "dev" | "preview"
conclusion?: null | "processing" | "published" | "success" | "failure" | "cancelled" | "timed_out"
status?: null | "requested" | "in_progress" | "completed" | "queued" | "waiting"
id: string
createdAt: Date
updatedAt?: Date
deletedAt?: Date
snapshot: Snapshots
snapshotId: string
}
