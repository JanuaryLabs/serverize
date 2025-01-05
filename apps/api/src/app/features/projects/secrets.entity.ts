import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import Projects from '../management/projects.entity.ts';
import { type Relation } from 'typeorm';

@Entity('Secrets')
@Index(['projectId', 'label'], { unique: true })
export default class Secrets {
  @ManyToOne(() => Projects, (relatedEntity) => relatedEntity.secrets, {
    nullable: false,
  })
  project!: Relation<Projects>;
  @Column({ nullable: false, type: 'uuid' })
  projectId!: string;
  @Column({ nullable: false, type: 'varchar' })
  label!: string;
  @Column({
    nullable: true,
    default: 'dev',
    type: 'enum',
    enum: ['dev', 'preview'],
  })
  channel?: 'dev' | 'preview' | null;
  @Column({ nullable: false, type: 'bytea' })
  nonce!: Uint8Array;
  @Column({ nullable: false, type: 'bytea' })
  secret!: Uint8Array;
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  @CreateDateColumn()
  createdAt!: Date;
  @UpdateDateColumn()
  updatedAt?: Date;
  @DeleteDateColumn()
  deletedAt?: Date;
}