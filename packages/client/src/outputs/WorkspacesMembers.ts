import { DateConstructor } from './DateConstructor';
import { Members } from './Members';
import { Workspaces } from './Workspaces';
export interface WorkspacesMembers {
  workspace?: Workspaces;
  workspaceId?: null | string;
  member?: Members;
  memberId?: null | string;
  id: string;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
