import { Organizations } from './Organizations';
import { Members } from './Members';
import { DateConstructor } from './DateConstructor';
export interface OrganizationsMembers {
organization?: Organizations
organizationId?: null | string
member?: Members
memberId?: null | string
id: string
createdAt: Date
updatedAt?: Date
deletedAt?: Date
}
