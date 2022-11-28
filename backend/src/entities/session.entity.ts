import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'session' })
export default class SessionEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  username: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn({
    nullable: true,
  })
  updatedAt: number;

  @Column({
    type: 'datetime',
    nullable: true,
  })
  closedAt: Date;
}
