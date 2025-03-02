import type { Projects } from './projects.ts';
import type { Snapshots } from './snapshots.ts';
import type { Volumes } from './volumes.ts';
export interface Releases {
  volumes: Volumes[];
  volumesIds: string[];
  serviceName?: null | string;
  containerName?: null | string;
  tarLocation?: null | string;
  domainPrefix: string;
  port?: null | number;
  protocol?: null | 'https' | 'tcp';
  image?: null | string;
  runtimeConfig?: null | string;
  name: string;
  project: Projects;
  projectId: string;
  channel: 'dev' | 'preview';
  conclusion?:
    | null
    | 'processing'
    | 'published'
    | 'success'
    | 'failure'
    | 'cancelled'
    | 'timed_out';
  status?:
    | null
    | 'requested'
    | 'in_progress'
    | 'completed'
    | 'queued'
    | 'waiting';
  id: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: Date;
  snapshot: Snapshots;
  snapshotId: string;
}
