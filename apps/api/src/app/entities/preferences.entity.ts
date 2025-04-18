import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { type Relation } from 'typeorm';
import Organizations from '#entities/organizations.entity.ts';
import Users from '#entities/users.entity.ts';
import Workspaces from '#entities/workspaces.entity.ts';

@Entity('Preferences')
export default class Preferences {
  @JoinColumn()
  @OneToOne(
    () => Users,
    (relatedEntity) => relatedEntity.preference,
    { nullable: true },
  )
  user?: Relation<Users>;
  @Column({ nullable: true, type: 'varchar' })
  userId?: string | null;
  @ManyToOne(
    () => Organizations,
    (relatedEntity) => relatedEntity.preferences,
    { nullable: true },
  )
  organization?: Relation<Organizations>;
  @Column({ nullable: true, type: 'uuid' })
  organizationId?: string | null;
  @ManyToOne(
    () => Workspaces,
    (relatedEntity) => relatedEntity.preferences,
    { nullable: true },
  )
  workspace?: Relation<Workspaces>;
  @Column({ nullable: true, type: 'uuid' })
  workspaceId?: string | null;
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
