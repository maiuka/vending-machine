import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'user' })
export default class UserEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column('integer')
  deposit: number;

  @Column()
  role: string;
}
