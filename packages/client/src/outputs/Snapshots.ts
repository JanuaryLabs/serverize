import type { Releases } from './releases.ts';
export interface Snapshots {
  release: Releases;
  releaseId: string;
  name: string;
  id: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: Date;
}
