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
import ApiKeys from '#entities/api-keys.entity.ts';
import Releases from '#entities/releases.entity.ts';
import SecretsKeys from '#entities/secrets-keys.entity.ts';
import Secrets from '#entities/secrets.entity.ts';
import Workspaces from '#entities/workspaces.entity.ts';

@Entity('Projects')
@Index(['name', 'workspaceId'], { unique: true })
export default class Projects {
  @OneToMany(
    () => Releases,
    (relatedEntity) => relatedEntity.project,
    { nullable: false },
  )
  releases!: Releases[];
  @RelationId((entity: Projects) => entity.releases)
  releasesIds!: string[];
  @OneToMany(
    () => Secrets,
    (relatedEntity) => relatedEntity.project,
    { nullable: false },
  )
  secrets!: Secrets[];
  @RelationId((entity: Projects) => entity.secrets)
  secretsIds!: string[];
  @OneToMany(
    () => SecretsKeys,
    (relatedEntity) => relatedEntity.project,
    { nullable: false },
  )
  secretsKeys!: SecretsKeys[];
  @RelationId((entity: Projects) => entity.secretsKeys)
  secretsKeysIds!: string[];
  @OneToMany(
    () => ApiKeys,
    (relatedEntity) => relatedEntity.project,
    { nullable: false },
  )
  apiKeys!: ApiKeys[];
  @RelationId((entity: Projects) => entity.apiKeys)
  apiKeysIds!: string[];
  @Column({ nullable: false, type: 'varchar' })
  name!: string;
  @ManyToOne(
    () => Workspaces,
    (relatedEntity) => relatedEntity.projects,
    { nullable: false },
  )
  workspace!: Relation<Workspaces>;
  @Column({ nullable: false, type: 'uuid' })
  workspaceId!: string;
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
