import type { Projects } from './projects.ts';
export interface ApiKeys {
  project: Projects;
  projectId: string;
  key: string;
  id: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: Date;
}
