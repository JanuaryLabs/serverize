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
import Members from '#entities/members.entity.ts';
import Organizations from '#entities/organizations.entity.ts';

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
