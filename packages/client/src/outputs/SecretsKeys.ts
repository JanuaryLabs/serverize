import { Projects } from './Projects';
export interface SecretsKeys {
  project: Projects;
  projectId: string;
  key: Uint8Array<ArrayBufferLike>;
  id: string;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
