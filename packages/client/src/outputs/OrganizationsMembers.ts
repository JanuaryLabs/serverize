import { DateConstructor } from './DateConstructor';
import { Members } from './Members';
import { Organizations } from './Organizations';
export interface OrganizationsMembers {
  organization?: Organizations;
  organizationId?: null | string;
  member?: Members;
  memberId?: null | string;
  id: string;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
