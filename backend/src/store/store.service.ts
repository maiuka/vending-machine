import { Injectable } from '@nestjs/common';
import CreateUserDto from '../dtos/create-user.dto';
import { v4 as uuidv4 } from 'uuid';
import UserEntity from '../entities/user.entity';
import UpdateUserDto from '../dtos/update-user.dto';
import {
  UserDepositInsufficient,
  UserNotFound,
} from '../exceptions/user.exceptions';
import CreateProductDto from '../dtos/create-product.dto';
import ProductEntity from '../entities/product.entity';
import UpdateProductDto from '../dtos/update-product.dto';
import {
  DuplicateProduct,
  ProductAmountNotAvailable,
  ProductNotFound,
} from '../exceptions/product.exceptions';
import BuyDto from '../dtos/buy.dto';
import {
  ArgumentRequired,
  InvalidNumber,
  NotPositiveNumber,
  ValueRequired,
} from '../exceptions/system.exceptions';
import {
  hashPassword,
  numberToCoinsCounts,
  removeUserPassword as RP,
} from '../utils/utils';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import SessionEntity from '../entities/session.entity';

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,
    @InjectRepository(SessionEntity)
    private sessionRepository: Repository<SessionEntity>,
  ) {}

  //////////////////////////////////////////////////
  // Users
  //////////////////////////////////////////////////
  async findAllUsers() {
    return (await this.userRepository.find()).map((u) => RP(u));
  }

  async findUserById(id: string) {
    if (!id) {
      throw new ArgumentRequired('id');
    }
    return RP(await this.userRepository.findOneBy({ id }));
  }

  async findUserByUsername(username: string, includePassword?: boolean) {
    if (!username) {
      throw new ArgumentRequired('username');
    }
    username = username.toLowerCase();
    const user = await this.userRepository.findOneBy({ username });
    return includePassword ? user : RP(user);
  }

  async createUser(dto: CreateUserDto) {
    const hash = await hashPassword(dto.password);
    const newUser = this.userRepository.create({
      ...dto,
      username: dto.username.toLowerCase(),
      password: hash,
    });
    newUser.id = uuidv4();
    newUser.deposit = 0;
    return RP(await this.userRepository.save(newUser));
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    const user = await this.findUserById(id);
    if (!user) {
      throw new UserNotFound(id);
    }
    return RP(await this.userRepository.save({ ...user, ...dto }));
  }

  async removeUser(id: string) {
    const user = await this.findUserById(id);
    if (!user) {
      throw new UserNotFound(id);
    }
    return RP(await this.userRepository.remove(user));
  }

  async withdrawUserDeposit(id: string, amountToWithdraw: number) {
    const user = await this.findUserById(id);
    if (!user) {
      throw new UserNotFound(id);
    }

    if (user.deposit < amountToWithdraw) {
      throw new UserDepositInsufficient(user.deposit, amountToWithdraw);
    }

    user.deposit -= amountToWithdraw;
    return RP(await this.userRepository.save({ ...user }));
  }

  async depositToUserAccount(userId: string, depositValue: number) {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new UserNotFound(userId);
    }

    user.deposit += depositValue;
    return RP(await this.userRepository.save({ ...user }));
  }

  async resetUserDeposit(userId: string) {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new UserNotFound(user.id);
    }
    user.deposit = 0;
    return RP(await this.userRepository.save({ ...user }));
  }

  async createUserSession(username: string) {
    const newSession = this.sessionRepository.create({
      id: uuidv4(),
      username,
      createdAt: new Date(),
    });
    return await this.sessionRepository.save(newSession);
  }
  //////////////////////////////////////////////////
  // Product
  //////////////////////////////////////////////////
  async createProduct(userId: string, dto: CreateProductDto) {
    const newProduct = this.productRepository.create(dto);
    newProduct.id = uuidv4();
    newProduct.sellerId = userId;
    return this.productRepository.save(newProduct);
  }

  async findAllProducts() {
    return this.productRepository.find();
  }

  async findProductById(id: string) {
    if (!id) {
      throw new ArgumentRequired('id');
    }
    return this.productRepository.findOneBy({ id });
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    const product = await this.findProductById(id);
    if (!product) {
      throw new ProductNotFound(id);
    }
    return this.productRepository.save({ ...product, ...dto });
  }

  async removeProduct(id: string) {
    const product = await this.findProductById(id);
    if (!product) {
      throw new ProductNotFound(id);
    }
    return this.productRepository.remove(product);
  }

  // This function should behave like a transaction.
  async buyProducts(userId: string, dto: BuyDto) {
    const storeUser = await this.findUserById(userId);
    if (!storeUser) {
      throw new UserNotFound(userId);
    }

    // Validate the products to buy...
    const productsToBuy: ProductEntity[] = [];
    for (let i = 0; i < dto.products.length; i++) {
      const product = dto.products[i];
      if (product.productId) {
        const duplicateProduct = dto.products.find(
          (p) => p.productId === product.productId && p !== product,
        );
        if (duplicateProduct) {
          throw new DuplicateProduct(product.productId);
        }
      } else {
        throw new ValueRequired('Product ID');
      }

      const productAmountName = 'Product amount';
      if (!product.productAmount) {
        throw new ValueRequired(productAmountName);
      }
      if (typeof product.productAmount !== 'number') {
        throw new InvalidNumber(productAmountName, product.productAmount);
      }
      if (product.productAmount <= 0) {
        throw new NotPositiveNumber(productAmountName, product.productAmount);
      }

      const storeProduct = await this.findProductById(product.productId);
      if (!storeProduct) {
        throw new ProductNotFound(product.productId);
      }
      if (product.productAmount > storeProduct.amountAvailable) {
        throw new ProductAmountNotAvailable(
          product.productId,
          product.productAmount,
        );
      }

      productsToBuy.push(storeProduct);
    }

    const costSum = dto.products
      .map(
        (p) =>
          p.productAmount *
          productsToBuy.find((ptb) => ptb.id === p.productId).cost,
      )
      .reduce((prev, curr) => prev + curr, 0);

    if (storeUser.deposit < costSum) {
      throw new UserDepositInsufficient(storeUser.deposit, costSum);
    }

    for (let i = 0; i < dto.products.length; i++) {
      const product = dto.products[i];
      const productToBuy = productsToBuy[i];
      productToBuy.amountAvailable -= product.productAmount;
      await this.productRepository.save({ ...productToBuy });
    }

    const updatedUser = await this.withdrawUserDeposit(storeUser.id, costSum);
    const change = await numberToCoinsCounts(updatedUser.deposit);

    return {
      totalSpent: costSum,
      change,
      purchasedProducts: productsToBuy,
    };
  }
}
