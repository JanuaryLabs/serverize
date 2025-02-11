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
import Releases from '#entities/releases.entity.ts';

@Entity('Snapshots')
export default class Snapshots {
  @JoinColumn()
  @OneToOne(
    () => Releases,
    (relatedEntity) => relatedEntity.snapshot,
    { nullable: false },
  )
  release!: Relation<Releases>;
  @Column({ nullable: false, type: 'uuid' })
  releaseId!: string;
  @Column({ nullable: false, type: 'varchar' })
  name!: string;
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
