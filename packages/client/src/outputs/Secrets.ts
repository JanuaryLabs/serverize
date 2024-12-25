import { Projects } from './Projects';
import { DateConstructor } from './DateConstructor';
export interface Secrets {
project: Projects
projectId: string
label: string
channel?: null | "dev" | "preview"
nonce: Uint8Array<ArrayBufferLike>
secret: Uint8Array<ArrayBufferLike>
id: string
createdAt: Date
updatedAt?: Date
deletedAt?: Date
}
