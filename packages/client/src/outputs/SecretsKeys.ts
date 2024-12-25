import { Projects } from './Projects';
import { DateConstructor } from './DateConstructor';
export interface SecretsKeys {
project: Projects
projectId: string
key: Uint8Array<ArrayBufferLike>
id: string
createdAt: Date
updatedAt?: Date
deletedAt?: Date
}
