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
import Members from '#entities/members.entity.ts';
import OrganizationsMembers from '#entities/organizations-members.entity.ts';
import Preferences from '#entities/preferences.entity.ts';
import Workspaces from '#entities/workspaces.entity.ts';

@Entity('Organizations')
export default class Organizations {
  @Column({ nullable: false, unique: true, type: 'varchar' })
  name!: string;
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  @CreateDateColumn({
    transformer: {
      to: (value: unknown) => value,
      from: (value: unknown) =>
        value instanceof Date ? value.toISOString() : value,
    },
  })
  createdAt!: string;
  @UpdateDateColumn({
    transformer: {
      to: (value: unknown) => value,
      from: (value: unknown) =>
        value instanceof Date ? value.toISOString() : value,
    },
  })
  updatedAt?: string;
  @DeleteDateColumn()
  deletedAt?: Date;
  @OneToMany(
    () => Workspaces,
    (relatedEntity) => relatedEntity.organization,
    { nullable: true },
  )
  workspaces?: Workspaces[];
  @RelationId((entity: Organizations) => entity.workspaces)
  workspacesIds?: string[] | null;
  @OneToMany(
    () => Members,
    (relatedEntity) => relatedEntity.organization,
    { nullable: true },
  )
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
  @OneToMany(
    () => Preferences,
    (relatedEntity) => relatedEntity.organization,
    { nullable: true },
  )
  preferences?: Preferences[];
  @RelationId((entity: Organizations) => entity.preferences)
  preferencesIds?: string[] | null;
}
