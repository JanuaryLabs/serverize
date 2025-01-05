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
import Organizations from './organizations.entity.ts';
import Projects from './projects.entity.ts';
import Users from './users.entity.ts';
import Workspaces from './workspaces.entity.ts';

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
  @ManyToOne(
    () => Projects,
    (relatedEntity) => relatedEntity.preferences,
    { nullable: true },
  )
  project?: Relation<Projects>;
  @Column({ nullable: true, type: 'uuid' })
  projectId?: string | null;
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  @CreateDateColumn()
  createdAt!: Date;
  @UpdateDateColumn()
  updatedAt?: Date;
  @DeleteDateColumn()
  deletedAt?: Date;
}
