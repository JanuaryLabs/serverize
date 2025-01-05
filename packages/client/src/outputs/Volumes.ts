import { DateConstructor } from './DateConstructor';
import { Releases } from './Releases';
export interface Volumes {
  release: Releases;
  releaseId: string;
  src: string;
  dest: string;
  id: string;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
