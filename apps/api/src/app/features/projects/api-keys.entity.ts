import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import Organizations from '../management/organizations.entity.ts';
import Projects from '../management/projects.entity.ts';
import { type Relation } from 'typeorm';

@Entity('ApiKeys')
export default class ApiKeys {
  @ManyToOne(() => Organizations, (relatedEntity) => relatedEntity.apiKeys, {
    nullable: false,
  })
  organization!: Relation<Organizations>;
  @Column({ nullable: false, type: 'uuid' })
  organizationId!: string;
  @ManyToOne(() => Projects, (relatedEntity) => relatedEntity.apiKeys, {
    nullable: false,
  })
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