import Organizations from './organizations.entity.ts';
import Preferences from './preferences.entity.ts';
import Projects from './projects.entity.ts';
import WorkspacesMembers from './workspaces-members.entity.ts';
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

@Entity('Workspaces')
export default class Workspaces {
  @Column({ nullable: false, type: 'varchar' })
  name!: string;
  @ManyToOne(() => Organizations, (relatedEntity) => relatedEntity.workspaces, {
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
  @OneToMany(() => Projects, (relatedEntity) => relatedEntity.workspace, {
    nullable: false,
  })
  projects!: Projects[];
  @RelationId((entity: Workspaces) => entity.projects)
  projectsIds!: string[];
  @OneToMany(
    () => WorkspacesMembers,
    (relatedEntity) => relatedEntity.workspace,
    { nullable: true },
  )
  workspacesMembers?: WorkspacesMembers[];
  @RelationId((entity: Workspaces) => entity.workspacesMembers)
  workspacesMembersIds?: string[] | null;
  @OneToMany(() => Preferences, (relatedEntity) => relatedEntity.workspace, {
    nullable: true,
  })
  preferences?: Preferences[];
  @RelationId((entity: Workspaces) => entity.preferences)
  preferencesIds?: string[] | null;
}
