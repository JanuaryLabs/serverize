import type { Organizations } from './organizations.ts';
import type { Users } from './users.ts';
import type { Workspaces } from './workspaces.ts';
export interface Preferences {
  user?: Users;
  userId?: null | string;
  organization?: Organizations;
  organizationId?: null | string;
  workspace?: Workspaces;
  workspaceId?: null | string;
  id: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: Date;
}
