import { Volumes } from './Volumes';
import { Projects } from './Projects';
import { DateConstructor } from './DateConstructor';
import { Snapshots } from './Snapshots';
export interface Releases {
volumes: Volumes[]
volumesIds: string[]
serviceName?: null | string
containerName?: null | string
tarLocation?: null | string
domainPrefix: string
port?: null | number
image?: null | string
runtimeConfig?: null | string
name: string
project: Projects
projectId: string
channel: "dev" | "preview"
conclusion?: null | "processing" | "published" | "success" | "failure" | "cancelled" | "timed_out"
status?: null | "requested" | "in_progress" | "completed" | "queued" | "waiting"
id: string
createdAt: Date
updatedAt?: Date
deletedAt?: Date
snapshot: Snapshots
snapshotId: string
}
