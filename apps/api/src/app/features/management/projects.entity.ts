import ApiKeys from '../projects/api-keys.entity.ts';
import Releases from '../projects/releases.entity.ts';
import SecretsKeys from '../projects/secrets-keys.entity.ts';
import Secrets from '../projects/secrets.entity.ts';
import Preferences from './preferences.entity.ts';
import Workspaces from './workspaces.entity.ts';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';
import { type Relation } from 'typeorm';

@Entity('Projects')
@Index(['name', 'workspaceId'], { unique: true })
export default class Projects {
  @Column({ nullable: false, type: 'varchar' })
  name!: string;
  @ManyToOne(() => Workspaces, (relatedEntity) => relatedEntity.projects, {
    nullable: false,
  })
  workspace!: Relation<Workspaces>;
  @Column({ nullable: false, type: 'uuid' })
  workspaceId!: string;
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  @CreateDateColumn()
  createdAt!: Date;
  @UpdateDateColumn()
  updatedAt?: Date;
  @DeleteDateColumn()
  deletedAt?: Date;
  @OneToMany(() => Preferences, (relatedEntity) => relatedEntity.project, {
    nullable: true,
  })
  preferences?: Preferences[];
  @RelationId((entity: Projects) => entity.preferences)
  preferencesIds?: string[] | null;
  @OneToMany(() => Releases, (relatedEntity) => relatedEntity.project, {
    nullable: false,
  })
  releases!: Releases[];
  @RelationId((entity: Projects) => entity.releases)
  releasesIds!: string[];
  @OneToMany(() => Secrets, (relatedEntity) => relatedEntity.project, {
    nullable: false,
  })
  secrets!: Secrets[];
  @RelationId((entity: Projects) => entity.secrets)
  secretsIds!: string[];
  @OneToMany(() => SecretsKeys, (relatedEntity) => relatedEntity.project, {
    nullable: false,
  })
  secretsKeys!: SecretsKeys[];
  @RelationId((entity: Projects) => entity.secretsKeys)
  secretsKeysIds!: string[];
  @OneToMany(() => ApiKeys, (relatedEntity) => relatedEntity.project, {
    nullable: false,
  })
  apiKeys!: ApiKeys[];
  @RelationId((entity: Projects) => entity.apiKeys)
  apiKeysIds!: string[];
}
