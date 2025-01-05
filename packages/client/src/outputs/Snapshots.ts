import { DateConstructor } from './DateConstructor';
import { Releases } from './Releases';

export interface Snapshots {
  release: Releases;
  releaseId: string;
  name: string;
  id: string;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
