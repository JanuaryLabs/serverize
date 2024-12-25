import { Workspaces } from './Workspaces';
import { Members } from './Members';
import { DateConstructor } from './DateConstructor';
export interface WorkspacesMembers {
workspace?: Workspaces
workspaceId?: null | string
member?: Members
memberId?: null | string
id: string
createdAt: Date
updatedAt?: Date
deletedAt?: Date
}
