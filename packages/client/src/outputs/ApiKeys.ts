import { DateConstructor } from './DateConstructor';
import { Organizations } from './Organizations';
import { Projects } from './Projects';

export interface ApiKeys {
  organization: Organizations;
  organizationId: string;
  project: Projects;
  projectId: string;
  key: string;
  id: string;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
