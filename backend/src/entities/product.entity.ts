import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'product' })
export default class ProductEntity {
  @PrimaryColumn()
  id: string;

  @Column('integer')
  amountAvailable: number;

  @Column('decimal')
  cost: number;

  @Column()
  productName: string;

  @Column()
  sellerId: string;
}
