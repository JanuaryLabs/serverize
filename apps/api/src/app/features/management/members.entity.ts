import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  RelationId,
} from 'typeorm';
import Users from './users.entity.ts';
import Organizations from './organizations.entity.ts';
import OrganizationsMembers from './organizations-members.entity.ts';
import WorkspacesMembers from './workspaces-members.entity.ts';
import { type Relation } from 'typeorm';

@Entity('Members')
export default class Members {
  @ManyToOne(() => Users, (relatedEntity) => relatedEntity.members, {
    nullable: true,
  })
  user?: Relation<Users>;
  @Column({ nullable: true, type: 'varchar' })
  userId?: string | null;
  @ManyToOne(() => Organizations, (relatedEntity) => relatedEntity.members, {
    nullable: true,
  })
  organization?: Relation<Organizations>;
  @Column({ nullable: true, type: 'uuid' })
  organizationId?: string | null;
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  @CreateDateColumn()
  createdAt!: Date;
  @UpdateDateColumn()
  updatedAt?: Date;
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
  @OneToMany(() => WorkspacesMembers, (relatedEntity) => relatedEntity.member, {
    nullable: true,
  })
  workspacesMembers?: WorkspacesMembers[];
  @RelationId((entity: Members) => entity.workspacesMembers)
  workspacesMembersIds?: string[] | null;
}