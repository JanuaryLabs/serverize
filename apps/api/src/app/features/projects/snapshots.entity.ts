import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
} from 'typeorm';
import Releases from './releases.entity.ts';
import { type Relation } from 'typeorm';

@Entity('Snapshots')
export default class Snapshots {
  @JoinColumn()
  @OneToOne(() => Releases, (relatedEntity) => relatedEntity.snapshot, {
    nullable: false,
  })
  release!: Relation<Releases>;
  @Column({ nullable: false, type: 'uuid' })
  releaseId!: string;
  @Column({ nullable: false, type: 'varchar' })
  name!: string;
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  @CreateDateColumn()
  createdAt!: Date;
  @UpdateDateColumn()
  updatedAt?: Date;
  @DeleteDateColumn()
  deletedAt?: Date;
}