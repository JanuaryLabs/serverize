import type { Members } from './members.ts';
import type { Organizations } from './organizations.ts';
export interface OrganizationsMembers {
  organization?: Organizations;
  organizationId?: null | string;
  member?: Members;
  memberId?: null | string;
  id: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: Date;
}
