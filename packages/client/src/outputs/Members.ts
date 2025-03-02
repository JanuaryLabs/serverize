import type { OrganizationsMembers } from './organizations-members.ts';
import type { Organizations } from './organizations.ts';
import type { Users } from './users.ts';
import type { WorkspacesMembers } from './workspaces-members.ts';
export interface Members {
  user?: Users;
  userId?: null | string;
  organization?: Organizations;
  organizationId?: null | string;
  id: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: Date;
  organizationsMembers?: OrganizationsMembers[];
  organizationsMembersIds?: null | string[];
  workspacesMembers?: WorkspacesMembers[];
  workspacesMembersIds?: null | string[];
}
