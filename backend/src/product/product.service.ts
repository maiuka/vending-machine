import { Injectable } from '@nestjs/common';
import { StoreService } from '../store/store.service';
import CreateProductDto from '../dtos/create-product.dto';
import UpdateProductDto from '../dtos/update-product.dto';
import ProductEntity from '../entities/product.entity';
import BuyDto from '../dtos/buy.dto';

@Injectable()
export class ProductService {
  constructor(private storeService: StoreService) {}

  async create(userId: string, dto: CreateProductDto) {
    return await this.storeService.createProduct(userId, dto);
  }

  async findAll() {
    return this.storeService.findAllProducts();
  }

  async findById(id: string): Promise<ProductEntity | undefined> {
    return await this.storeService.findProductById(id);
  }

  async update(id: string, dto: UpdateProductDto) {
    return await this.storeService.updateProduct(id, dto);
  }

  async remove(id: string) {
    return await this.storeService.removeProduct(id);
  }

  async buyProducts(userId: string, dto: BuyDto) {
    return await this.storeService.buyProducts(userId, dto);
  }
}
