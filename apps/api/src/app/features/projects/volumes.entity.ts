import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import Releases from './releases.entity.ts';
import { type Relation } from 'typeorm';

@Entity('Volumes')
export default class Volumes {
  @ManyToOne(() => Releases, (relatedEntity) => relatedEntity.volumes, {
    nullable: false,
  })
  release!: Relation<Releases>;
  @Column({ nullable: false, type: 'uuid' })
  releaseId!: string;
  @Column({ nullable: false, unique: true, type: 'varchar' })
  src!: string;
  @Column({ nullable: false, type: 'varchar' })
  dest!: string;
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  @CreateDateColumn()
  createdAt!: Date;
  @UpdateDateColumn()
  updatedAt?: Date;
  @DeleteDateColumn()
  deletedAt?: Date;
}