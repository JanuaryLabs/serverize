import { Releases } from './Releases';
import { DateConstructor } from './DateConstructor';
export interface Snapshots {
release: Releases
releaseId: string
name: string
id: string
createdAt: Date
updatedAt?: Date
deletedAt?: Date
}
