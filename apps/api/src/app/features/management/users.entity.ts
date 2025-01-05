import {
  Entity,
  PrimaryColumn,
  OneToMany,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  RelationId,
} from 'typeorm';
import Members from './members.entity.ts';
import Preferences from './preferences.entity.ts';
import { type Relation } from 'typeorm';

@Entity('Users')
export default class Users {
  @OneToMany(() => Members, (relatedEntity) => relatedEntity.user, {
    nullable: true,
  })
  members?: Members[];
  @RelationId((entity: Users) => entity.members)
  membersIds?: string[] | null;
  @PrimaryColumn('varchar')
  id!: string;
  @CreateDateColumn()
  createdAt!: Date;
  @UpdateDateColumn()
  updatedAt?: Date;
  @DeleteDateColumn()
  deletedAt?: Date;
  @OneToOne(() => Preferences, (relatedEntity) => relatedEntity.user, {
    nullable: true,
  })
  preference?: Relation<Preferences>;
  @RelationId((entity: Users) => entity.preference)
  preferenceId?: string | null;
}