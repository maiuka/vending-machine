import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  BadRequestException,
  NotFoundException,
  UseGuards,
  Request,
  Put,
  ForbiddenException,
} from '@nestjs/common';
import { SELLER } from '../auth/auth.roles';
import { ProductService } from './product.service';
import CreateProductDto from '../dtos/create-product.dto';
import UpdateProductDto from '../dtos/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { forbidden, notFound, required } from '../utils/message-utils';
import { UserService } from '../user/user.service';

@Controller('product')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly userService: UserService,
  ) {}

  @Get()
  async findAll() {
    return await this.productService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const product = await this.productService.findById(id);
    if (!product) {
      throw new NotFoundException(notFound(`Product ID (${id})`));
    }
    return product;
  }

  @Post()
  @UseGuards(new JwtAuthGuard(SELLER))
  async create(@Body() dto: CreateProductDto, @Request() req) {
    if (!dto.amountAvailable) {
      throw new BadRequestException(required('amountAvailable'));
    }
    if (!dto.productName) {
      throw new BadRequestException(required('productName'));
    }
    if (!dto.cost) {
      throw new BadRequestException(required('cost'));
    }
    if (!req || !req.user || !req.user.id) {
      throw new BadRequestException(required('userId'));
    }

    const userId = req.user.id as string;
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException(notFound(`User ID (${userId})`));
    }

    return await this.productService.create(userId, dto);
  }

  @Put(':id')
  @UseGuards(new JwtAuthGuard(SELLER))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @Request() req,
  ) {
    await this.validateAccess(id, req.user.id, 'update');
    return this.productService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(new JwtAuthGuard(SELLER))
  async remove(@Param('id') id: string, @Request() req) {
    await this.validateAccess(id, req.user.id, 'delete');
    return await this.productService.remove(id);
  }

  private async validateAccess(
    producId: string,
    userId: string,
    action: string,
  ) {
    if (!producId) {
      throw new BadRequestException(required('producId'));
    }

    const product = await this.productService.findById(producId);
    if (!product) {
      throw new NotFoundException(notFound(`Product ID (${producId})`));
    }

    if (!userId || !product.sellerId || product.sellerId !== userId) {
      throw new ForbiddenException(
        forbidden(action + ` product ID (${producId})`),
      );
    }
  }
}
