import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import SessionEntity from '../entities/session.entity';
import ProductEntity from '../entities/product.entity';
import UserEntity from '../entities/user.entity';
import { StoreService } from './store.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, ProductEntity, SessionEntity]),
  ],
  providers: [StoreService],
  exports: [StoreService],
})
export class StoreModule {}
