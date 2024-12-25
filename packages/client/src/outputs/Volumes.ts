import { Releases } from './Releases';
import { DateConstructor } from './DateConstructor';
export interface Volumes {
release: Releases
releaseId: string
src: string
dest: string
id: string
createdAt: Date
updatedAt?: Date
deletedAt?: Date
}
