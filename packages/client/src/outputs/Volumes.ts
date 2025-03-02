import type { Releases } from './releases.ts';
export interface Volumes {
  release: Releases;
  releaseId: string;
  src: string;
  dest: string;
  id: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: Date;
}
