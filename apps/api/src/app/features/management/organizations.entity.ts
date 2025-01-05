import ApiKeys from '../projects/api-keys.entity.ts';
import Members from './members.entity.ts';
import OrganizationsMembers from './organizations-members.entity.ts';
import Preferences from './preferences.entity.ts';
import Workspaces from './workspaces.entity.ts';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';

@Entity('Organizations')
export default class Organizations {
  @Column({ nullable: false, unique: true, type: 'varchar' })
  name!: string;
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  @CreateDateColumn()
  createdAt!: Date;
  @UpdateDateColumn()
  updatedAt?: Date;
  @DeleteDateColumn()
  deletedAt?: Date;
  @OneToMany(() => Workspaces, (relatedEntity) => relatedEntity.organization, {
    nullable: true,
  })
  workspaces?: Workspaces[];
  @RelationId((entity: Organizations) => entity.workspaces)
  workspacesIds?: string[] | null;
  @OneToMany(() => Members, (relatedEntity) => relatedEntity.organization, {
    nullable: true,
  })
  members?: Members[];
  @RelationId((entity: Organizations) => entity.members)
  membersIds?: string[] | null;
  @OneToMany(
    () => OrganizationsMembers,
    (relatedEntity) => relatedEntity.organization,
    { nullable: true },
  )
  organizationsMembers?: OrganizationsMembers[];
  @RelationId((entity: Organizations) => entity.organizationsMembers)
  organizationsMembersIds?: string[] | null;
  @OneToMany(() => Preferences, (relatedEntity) => relatedEntity.organization, {
    nullable: true,
  })
  preferences?: Preferences[];
  @RelationId((entity: Organizations) => entity.preferences)
  preferencesIds?: string[] | null;
  @OneToMany(() => ApiKeys, (relatedEntity) => relatedEntity.organization, {
    nullable: false,
  })
  apiKeys!: ApiKeys[];
  @RelationId((entity: Organizations) => entity.apiKeys)
  apiKeysIds!: string[];
}
