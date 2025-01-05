import Releases from './releases.entity.ts';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
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
