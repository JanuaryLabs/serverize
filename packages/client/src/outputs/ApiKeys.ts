import { Projects } from './Projects';
export interface ApiKeys {
  project: Projects;
  projectId: string;
  key: string;
  id: string;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
