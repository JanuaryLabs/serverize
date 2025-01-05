import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import Organizations from './organizations.entity.ts';
import Members from './members.entity.ts';
import { type Relation } from 'typeorm';

@Entity('OrganizationsMembers')
export default class OrganizationsMembers {
  @ManyToOne(
    () => Organizations,
    (relatedEntity) => relatedEntity.organizationsMembers,
    { nullable: true },
  )
  organization?: Relation<Organizations>;
  @Column({ nullable: true, type: 'uuid' })
  organizationId?: string | null;
  @ManyToOne(
    () => Members,
    (relatedEntity) => relatedEntity.organizationsMembers,
    { nullable: true },
  )
  member?: Relation<Members>;
  @Column({ nullable: true, type: 'uuid' })
  memberId?: string | null;
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  @CreateDateColumn()
  createdAt!: Date;
  @UpdateDateColumn()
  updatedAt?: Date;
  @DeleteDateColumn()
  deletedAt?: Date;
}