import {
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';
import { type Relation } from 'typeorm';
import Members from '#entities/members.entity.ts';
import Preferences from '#entities/preferences.entity.ts';

@Entity('Users')
export default class Users {
  @OneToMany(
    () => Members,
    (relatedEntity) => relatedEntity.user,
    { nullable: true },
  )
  members?: Members[];
  @RelationId((entity: Users) => entity.members)
  membersIds?: string[] | null;
  @PrimaryColumn('varchar')
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
  @OneToOne(
    () => Preferences,
    (relatedEntity) => relatedEntity.user,
    { nullable: true },
  )
  preference?: Relation<Preferences>;
  @RelationId((entity: Users) => entity.preference)
  preferenceId?: string | null;
}
