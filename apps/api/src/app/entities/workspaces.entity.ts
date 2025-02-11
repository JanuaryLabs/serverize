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
import Organizations from '#entities/organizations.entity.ts';
import Preferences from '#entities/preferences.entity.ts';
import Projects from '#entities/projects.entity.ts';
import WorkspacesMembers from '#entities/workspaces-members.entity.ts';

@Entity('Workspaces')
export default class Workspaces {
  @Column({ nullable: false, type: 'varchar' })
  name!: string;
  @ManyToOne(
    () => Organizations,
    (relatedEntity) => relatedEntity.workspaces,
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
    () => Projects,
    (relatedEntity) => relatedEntity.workspace,
    { nullable: false },
  )
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
  @OneToMany(
    () => Preferences,
    (relatedEntity) => relatedEntity.workspace,
    { nullable: true },
  )
  preferences?: Preferences[];
  @RelationId((entity: Workspaces) => entity.preferences)
  preferencesIds?: string[] | null;
}
