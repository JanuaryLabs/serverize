import { DateConstructor } from './DateConstructor';
import { Organizations } from './Organizations';
import { Projects } from './Projects';
import { Users } from './Users';
import { Workspaces } from './Workspaces';

export interface Preferences {
  user?: Users;
  userId?: null | string;
  organization?: Organizations;
  organizationId?: null | string;
  workspace?: Workspaces;
  workspaceId?: null | string;
  project?: Projects;
  projectId?: null | string;
  id: string;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
