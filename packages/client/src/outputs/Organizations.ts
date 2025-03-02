import type { Members } from './members.ts';
import type { OrganizationsMembers } from './organizations-members.ts';
import type { Preferences } from './preferences.ts';
import type { Workspaces } from './workspaces.ts';
export interface Organizations {
  name: string;
  id: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: Date;
  workspaces?: Workspaces[];
  workspacesIds?: null | string[];
  members?: Members[];
  membersIds?: null | string[];
  organizationsMembers?: OrganizationsMembers[];
  organizationsMembersIds?: null | string[];
  preferences?: Preferences[];
  preferencesIds?: null | string[];
}
