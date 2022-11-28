import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BUYER, SELLER } from './auth/auth.roles';
import AppConfig from './core/app-config';
import CreateUserDto from './dtos/create-user.dto';
import { ProductModule } from './product/product.module';
import { UserController } from './user/user.controller';
import { UserModule } from './user/user.module';
import * as fs from 'fs';
import { ProductController } from './product/product.controller';
import CreateProductDto from './dtos/create-product.dto';
import ProductEntity from './entities/product.entity';

describe('AppController', () => {
  // Seller user
  const sellerUsername = 'sellerUsername';
  const sellerPassword = 'sellerPassword';
  const sellerCreateUserDto: CreateUserDto = {
    username: sellerUsername,
    password: sellerPassword,
    role: SELLER,
  };

  // Buyer user
  const buyerUsername = 'buyerUsername';
  const buyerPassword = 'buyerPassword';
  const buyerCreateUserDto: CreateUserDto = {
    username: buyerUsername,
    password: buyerPassword,
    role: BUYER,
  };

  // Products
  const p1Cost = 15;
  const p1AmountAvailable = 100;
  const p1ProductName = 'Product 1';
  const p2Cost = 30;
  const p2AmountAvailable = 200;
  const p2ProductName = 'Product 2';
  const p1AmountPurchased = 2;
  const p2AmountPurchased = 3;
  const pCostUpdate = 150;
  const pAmountAvailableUpdate = 12345;
  const pProductNameUpdate = 'Product Update';

  let appController: AppController;
  let userController: UserController;
  let productController: ProductController;
  let sellerUserId: string;
  let buyerUserId: string;
  let productEntity1: ProductEntity;
  let productEntity2: ProductEntity;

  const createProduct = async (p: CreateProductDto, userId: string) => {
    const resp = await productController.create(p, {
      user: { id: userId },
    });

    expect(resp.id).toBeDefined();
    expect(resp.cost).toBe(p.cost);
    expect(resp.productName).toBe(p.productName);
    expect(resp.amountAvailable).toBe(p.amountAvailable);
    expect(resp.sellerId).toBe(userId);
    return resp;
  };

  const depositCoin = async (depositValue: number, userId: string) => {
    const resp = await appController.deposit(
      {
        value: depositValue,
      },
      { user: { id: userId } },
    );
    expect(resp.id).toBe(userId);
    expect(resp.role).toBe(BUYER);
    return resp;
  };

  beforeAll(async () => {
    try {
      fs.unlinkSync(AppConfig.DB_NAME);
    } catch (error) {
      //
    }
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule,
        UserModule,
        ProductModule,
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: AppConfig.DB_NAME,
          entities: [__dirname + '/**/*.entity{.js,.ts}'],
          synchronize: true,
        }),
      ],
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
    userController = app.get<UserController>(UserController);
    productController = app.get<ProductController>(ProductController);
  });

  it('Controllers should be defined', () => {
    expect(appController).toBeDefined();
    expect(userController).toBeDefined();
    expect(productController).toBeDefined();
  });

  describe('Create', () => {
    it('Create seller user', async () => {
      const resp = await userController.create(sellerCreateUserDto);
      sellerUserId = resp.id;
      expect(resp.id).toBeDefined();
      expect(resp.username).toBe(sellerUsername.toLowerCase());
      expect(resp.role).toBe(SELLER);
      expect(resp.deposit).toBe(0);
    });

    it('Create buyer user', async () => {
      const resp = await userController.create(buyerCreateUserDto);
      buyerUserId = resp.id;
      expect(resp.id).toBeDefined();
      expect(resp.username).toBe(buyerUsername.toLowerCase());
      expect(resp.role).toBe(BUYER);
      expect(resp.deposit).toBe(0);
    });

    it('Create products', async () => {
      productEntity1 = await createProduct(
        {
          productName: p1ProductName,
          cost: p1Cost,
          amountAvailable: p1AmountAvailable,
        },
        sellerUserId,
      );
      productEntity2 = await createProduct(
        {
          productName: p2ProductName,
          cost: p2Cost,
          amountAvailable: p2AmountAvailable,
        },
        sellerUserId,
      );
    });

    it('Deposit', async () => {
      const depositValue = 100;
      let resp = await depositCoin(depositValue, buyerUserId);
      expect(resp.username).toBe(buyerUsername.toLowerCase());
      expect(resp.password).toBeUndefined();
      expect(resp.deposit).toBe(depositValue);
      //
      resp = await depositCoin(depositValue, buyerUserId);
      expect(resp.username).toBe(buyerUsername.toLowerCase());
      expect(resp.password).toBeUndefined();
      expect(resp.deposit).toBe(depositValue * 2);
    });

    it('Buy', async () => {
      const resp = await appController.buy(
        {
          products: [
            {
              productId: productEntity1.id,
              productAmount: p1AmountPurchased,
            },
            {
              productId: productEntity2.id,
              productAmount: p2AmountPurchased,
            },
          ],
        },
        { user: { id: buyerUserId } },
      );

      const totalSpent =
        p1AmountPurchased * p1Cost + p2AmountPurchased * p2Cost;
      expect(resp.totalSpent).toBe(totalSpent);
      expect(resp.purchasedProducts).toHaveLength(2);
      expect(resp.purchasedProducts.map((p) => p.id)).toContain(
        productEntity1.id,
      );
      expect(resp.purchasedProducts.map((p) => p.id)).toContain(
        productEntity2.id,
      );
      expect(
        resp.purchasedProducts.find((p) => p.id === productEntity1.id)
          .amountAvailable,
      ).toBe(p1AmountAvailable - p1AmountPurchased);
      expect(
        resp.purchasedProducts.find((p) => p.id === productEntity2.id)
          .amountAvailable,
      ).toBe(p2AmountAvailable - p2AmountPurchased);
      expect(
        resp.change.map((c) => c.value * c.count).reduce((p, c) => p + c, 0),
      ).toBe(200 - totalSpent);
    });
  });

  describe('Product CRUD', () => {
    // Create is tested above.

    it('Read all products', async () => {
      const resp = await productController.findAll();
      expect(resp).toBeDefined();
      expect(resp).toHaveLength(2);
      expect(resp.map((p) => p.id)).toContain(productEntity1.id);
      expect(resp.map((p) => p.id)).toContain(productEntity2.id);
    });

    it('Read one product', async () => {
      const resp = await productController.findById(productEntity2.id);
      expect(resp).toBeDefined();
      expect(resp.id).toBe(productEntity2.id);
      expect(resp.productName).toBe(p2ProductName);
      expect(resp.cost).toBe(p2Cost);
      expect(resp.amountAvailable).toBe(p2AmountAvailable - p2AmountPurchased);
      expect(resp.sellerId).toBe(sellerUserId);
    });

    it('Update product', async () => {
      const resp = await productController.update(
        productEntity1.id,
        {
          cost: pCostUpdate,
          productName: pProductNameUpdate,
          amountAvailable: pAmountAvailableUpdate,
        },
        { user: { id: sellerUserId } },
      );
      expect(resp).toBeDefined();
      expect(resp.id).toBe(productEntity1.id);
      expect(resp.productName).toBe(pProductNameUpdate);
      expect(resp.cost).toBe(pCostUpdate);
      expect(resp.amountAvailable).toBe(pAmountAvailableUpdate);
      expect(resp.sellerId).toBe(sellerUserId);
    });

    it('Delete product', async () => {
      const resp = await productController.remove(productEntity1.id, {
        user: { id: sellerUserId },
      });
      expect(resp).toBeDefined();
      expect(resp.id).toBeUndefined();
      expect(resp.productName).toBe(pProductNameUpdate);
      expect(resp.cost).toBe(pCostUpdate);
      expect(resp.amountAvailable).toBe(pAmountAvailableUpdate);
      expect(resp.sellerId).toBe(sellerUserId);

      const all = await productController.findAll();
      expect(all).toBeDefined();
      expect(all.map((p) => p.id)).not.toContain(productEntity1.id);
    });
  });
});
