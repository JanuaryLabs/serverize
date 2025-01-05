import { DateConstructor } from './DateConstructor';
import { Organizations } from './Organizations';
import { Preferences } from './Preferences';
import { Projects } from './Projects';
import { WorkspacesMembers } from './WorkspacesMembers';

export interface Workspaces {
  name: string;
  organization?: Organizations;
  organizationId?: null | string;
  id: string;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  projects: Projects[];
  projectsIds: string[];
  workspacesMembers?: WorkspacesMembers[];
  workspacesMembersIds?: null | string[];
  preferences?: Preferences[];
  preferencesIds?: null | string[];
}
