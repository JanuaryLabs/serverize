import { DateConstructor } from './DateConstructor';
import { Members } from './Members';
import { Preferences } from './Preferences';
export interface Users {
  members?: Members[];
  membersIds?: null | string[];
  id: string;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  preference?: Preferences;
  preferenceId?: null | string;
}
