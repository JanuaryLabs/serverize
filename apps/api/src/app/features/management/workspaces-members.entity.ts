import Members from './members.entity.ts';
import Workspaces from './workspaces.entity.ts';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { type Relation } from 'typeorm';

@Entity('WorkspacesMembers')
export default class WorkspacesMembers {
  @ManyToOne(
    () => Workspaces,
    (relatedEntity) => relatedEntity.workspacesMembers,
    { nullable: true },
  )
  workspace?: Relation<Workspaces>;
  @Column({ nullable: true, type: 'uuid' })
  workspaceId?: string | null;
  @ManyToOne(
    () => Members,
    (relatedEntity) => relatedEntity.workspacesMembers,
    { nullable: true },
  )
  member?: Relation<Members>;
  @Column({ nullable: true, type: 'uuid' })
  memberId?: string | null;
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  @CreateDateColumn()
  createdAt!: Date;
  @UpdateDateColumn()
  updatedAt?: Date;
  @DeleteDateColumn()
  deletedAt?: Date;
}
