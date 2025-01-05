import Projects from '../management/projects.entity.ts';
import Snapshots from './snapshots.entity.ts';
import Volumes from './volumes.entity.ts';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';
import { type Relation } from 'typeorm';

@Entity('Releases')
export default class Releases {
  @OneToMany(() => Volumes, (relatedEntity) => relatedEntity.release, {
    nullable: false,
  })
  volumes!: Volumes[];
  @RelationId((entity: Releases) => entity.volumes)
  volumesIds!: string[];
  @Column({ nullable: true, type: 'varchar' })
  serviceName?: string | null;
  @Column({ nullable: true, type: 'varchar' })
  containerName?: string | null;
  @Column({ nullable: true, type: 'varchar' })
  tarLocation?: string | null;
  @Column({ nullable: false, type: 'varchar' })
  domainPrefix!: string;
  @Column({ nullable: true, type: 'integer' })
  port?: number | null;
  @Column({ nullable: true, type: 'varchar' })
  image?: string | null;
  @Column({ nullable: true, type: 'json' })
  runtimeConfig?: string | null;
  @Column({ nullable: false, type: 'varchar' })
  name!: string;
  @ManyToOne(() => Projects, (relatedEntity) => relatedEntity.releases, {
    nullable: false,
  })
  project!: Relation<Projects>;
  @Column({ nullable: false, type: 'uuid' })
  projectId!: string;
  @Column({
    nullable: false,
    default: 'dev',
    type: 'enum',
    enum: ['dev', 'preview'],
  })
  channel!: 'dev' | 'preview';
  @Column({
    nullable: true,
    type: 'enum',
    enum: [
      'processing',
      'published',
      'success',
      'failure',
      'cancelled',
      'timed_out',
    ],
  })
  conclusion?:
    | 'processing'
    | 'published'
    | 'success'
    | 'failure'
    | 'cancelled'
    | 'timed_out'
    | null;
  @Column({
    nullable: true,
    type: 'enum',
    enum: ['requested', 'in_progress', 'completed', 'queued', 'waiting'],
  })
  status?:
    | 'requested'
    | 'in_progress'
    | 'completed'
    | 'queued'
    | 'waiting'
    | null;
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  @CreateDateColumn()
  createdAt!: Date;
  @UpdateDateColumn()
  updatedAt?: Date;
  @DeleteDateColumn()
  deletedAt?: Date;
  @OneToOne(() => Snapshots, (relatedEntity) => relatedEntity.release, {
    nullable: false,
  })
  snapshot!: Relation<Snapshots>;
  @RelationId((entity: Releases) => entity.snapshot)
  snapshotId!: string;
}
