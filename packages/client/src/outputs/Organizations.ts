import { DateConstructor } from './DateConstructor';
import { Workspaces } from './Workspaces';
import { Members } from './Members';
import { OrganizationsMembers } from './OrganizationsMembers';
import { Preferences } from './Preferences';
import { ApiKeys } from './ApiKeys';
export interface Organizations {
name: string
id: string
createdAt: Date
updatedAt?: Date
deletedAt?: Date
workspaces?: Workspaces[]
workspacesIds?: null | string[]
members?: Members[]
membersIds?: null | string[]
organizationsMembers?: OrganizationsMembers[]
organizationsMembersIds?: null | string[]
preferences?: Preferences[]
preferencesIds?: null | string[]
apiKeys: ApiKeys[]
apiKeysIds: string[]
}
