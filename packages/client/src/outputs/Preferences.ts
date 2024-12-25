import { Users } from './Users';
import { Organizations } from './Organizations';
import { Workspaces } from './Workspaces';
import { Projects } from './Projects';
import { DateConstructor } from './DateConstructor';
export interface Preferences {
user?: Users
userId?: null | string
organization?: Organizations
organizationId?: null | string
workspace?: Workspaces
workspaceId?: null | string
project?: Projects
projectId?: null | string
id: string
createdAt: Date
updatedAt?: Date
deletedAt?: Date
}
