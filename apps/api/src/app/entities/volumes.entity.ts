import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { type Relation } from 'typeorm';
import Releases from '#entities/releases.entity.ts';

@Entity('Volumes')
export default class Volumes {
  @ManyToOne(
    () => Releases,
    (relatedEntity) => relatedEntity.volumes,
    { nullable: false },
  )
  release!: Relation<Releases>;
  @Column({ nullable: false, type: 'uuid' })
  releaseId!: string;
  @Column({ nullable: false, unique: true, type: 'varchar' })
  src!: string;
  @Column({ nullable: false, type: 'varchar' })
  dest!: string;
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
