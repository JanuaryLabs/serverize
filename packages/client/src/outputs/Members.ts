import { Users } from './Users';
import { Organizations } from './Organizations';
import { DateConstructor } from './DateConstructor';
import { OrganizationsMembers } from './OrganizationsMembers';
import { WorkspacesMembers } from './WorkspacesMembers';
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
