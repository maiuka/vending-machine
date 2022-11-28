import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductModule } from './product/product.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { StoreModule } from './store/store.module';
import * as dotenv from 'dotenv';
import AppConfig from './core/app-config';

dotenv.config();

@Module({
  imports: [
    ProductModule,
    UserModule,
    AuthModule,
    StoreModule,
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: AppConfig.DB_NAME,
      entities: [__dirname + '/**/*.entity{.js,.ts}'],
      synchronize: process.env.VM_APP_ENV === 'dev',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
