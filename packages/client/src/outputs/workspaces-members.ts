import type { Members } from './members.ts';
import type { Workspaces } from './workspaces.ts';
export interface WorkspacesMembers {
  workspace?: Workspaces;
  workspaceId?: null | string;
  member?: Members;
  memberId?: null | string;
  id: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: Date;
}
