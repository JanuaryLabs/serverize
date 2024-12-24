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
import { SecretsKeys } from './SecretsKeys';
import { ApiKeys } from './ApiKeys';
import { PaginationMetadata } from './PaginationMetadata';
import { Claims } from './Claims';
import { StartRelease } from './StartRelease';
import { RestartChannel } from './RestartChannel';
import { GetConfig } from './GetConfig';
export interface RestartRelease {
traceId: `${string}-${string}-${string}-${string}-${string}`
releaseId: string
finalUrl: string
}
