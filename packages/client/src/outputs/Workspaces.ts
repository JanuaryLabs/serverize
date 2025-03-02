import type { Organizations } from './organizations.ts';
import type { Preferences } from './preferences.ts';
import type { Projects } from './projects.ts';
import type { WorkspacesMembers } from './workspaces-members.ts';
export interface Workspaces {
  name: string;
  organization?: Organizations;
  organizationId?: null | string;
  id: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: Date;
  projects: Projects[];
  projectsIds: string[];
  workspacesMembers?: WorkspacesMembers[];
  workspacesMembersIds?: null | string[];
  preferences?: Preferences[];
  preferencesIds?: null | string[];
}
