import type { Members } from './members.ts';
import type { Preferences } from './preferences.ts';
export interface Users {
  members?: Members[];
  membersIds?: null | string[];
  id: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: Date;
  preference?: Preferences;
  preferenceId?: null | string;
}
