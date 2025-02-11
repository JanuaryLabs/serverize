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
import Members from '#entities/members.entity.ts';
import Workspaces from '#entities/workspaces.entity.ts';

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
}
