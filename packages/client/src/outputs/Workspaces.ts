import { Organizations } from './Organizations';
import { DateConstructor } from './DateConstructor';
import { Projects } from './Projects';
import { WorkspacesMembers } from './WorkspacesMembers';
import { Preferences } from './Preferences';
export interface Workspaces {
name: string
organization?: Organizations
organizationId?: null | string
id: string
createdAt: Date
updatedAt?: Date
deletedAt?: Date
projects: Projects[]
projectsIds: string[]
workspacesMembers?: WorkspacesMembers[]
workspacesMembersIds?: null | string[]
preferences?: Preferences[]
preferencesIds?: null | string[]
}
