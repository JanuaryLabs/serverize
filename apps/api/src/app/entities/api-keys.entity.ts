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
import Projects from './projects.entity.ts';

@Entity('ApiKeys')
export default class ApiKeys {
  @ManyToOne(
    () => Projects,
    (relatedEntity) => relatedEntity.apiKeys,
    { nullable: false },
  )
  project!: Relation<Projects>;
  @Column({ nullable: false, type: 'uuid' })
  projectId!: string;
  @Column({ nullable: false, type: 'varchar' })
  key!: string;
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  @CreateDateColumn()
  createdAt!: Date;
  @UpdateDateColumn()
  updatedAt?: Date;
  @DeleteDateColumn()
  deletedAt?: Date;
}
