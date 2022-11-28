import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { StoreModule } from '../store/store.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [StoreModule, UserModule],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
