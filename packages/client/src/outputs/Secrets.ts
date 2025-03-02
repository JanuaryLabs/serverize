import type { Projects } from './projects.ts';
export interface Secrets {
  project: Projects;
  projectId: string;
  label: string;
  channel: 'dev' | 'preview';
  nonce: Uint8Array<ArrayBufferLike>;
  secret: Uint8Array<ArrayBufferLike>;
  id: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: Date;
}
