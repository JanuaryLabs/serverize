import type { Projects } from './projects.ts';
export interface SecretsKeys {
  project: Projects;
  projectId: string;
  key: Uint8Array<ArrayBufferLike>;
  id: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: Date;
}
