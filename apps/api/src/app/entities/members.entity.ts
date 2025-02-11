import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';
import { type Relation } from 'typeorm';
import OrganizationsMembers from '#entities/organizations-members.entity.ts';
import Organizations from '#entities/organizations.entity.ts';
import Users from '#entities/users.entity.ts';
import WorkspacesMembers from '#entities/workspaces-members.entity.ts';

@Entity('Members')
export default class Members {
  @ManyToOne(
    () => Users,
    (relatedEntity) => relatedEntity.members,
    { nullable: true },
  )
  user?: Relation<Users>;
  @Column({ nullable: true, type: 'varchar' })
  userId?: string | null;
  @ManyToOne(
    () => Organizations,
    (relatedEntity) => relatedEntity.members,
    { nullable: true },
  )
  organization?: Relation<Organizations>;
  @Column({ nullable: true, type: 'uuid' })
  organizationId?: string | null;
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
    () => OrganizationsMembers,
    (relatedEntity) => relatedEntity.member,
    { nullable: true },
  )
  organizationsMembers?: OrganizationsMembers[];
  @RelationId((entity: Members) => entity.organizationsMembers)
  organizationsMembersIds?: string[] | null;
  @OneToMany(
    () => WorkspacesMembers,
    (relatedEntity) => relatedEntity.member,
    { nullable: true },
  )
  workspacesMembers?: WorkspacesMembers[];
  @RelationId((entity: Members) => entity.workspacesMembers)
  workspacesMembersIds?: string[] | null;
}
