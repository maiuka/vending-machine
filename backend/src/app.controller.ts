import {
  Controller,
  Request,
  Post,
  UseGuards,
  Body,
  BadRequestException,
  Get,
  NotFoundException,
  BadGatewayException,
} from '@nestjs/common';
import { BUYER } from './auth/auth.roles';
import { AuthService } from './auth/auth.service';
import { LocalAuthGuard } from './auth/guards/local-auth.guard';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import AppConfig from './core/app-config';
import BuyDto from './dtos/buy.dto';
import DepositDto from './dtos/deposit.dto';
import { ProductService } from './product/product.service';
import { UserService } from './user/user.service';
import { notFound, required, shouldBeNumber } from './utils/message-utils';
import { numberToCoinsCounts } from './utils/utils';

@Controller()
export class AppController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly productService: ProductService,
  ) {}

  @Post('auth/login')
  @UseGuards(LocalAuthGuard)
  async login(@Request() req) {
    if (!req || !req.user || !req.user.username) {
      throw new BadRequestException(required('username'));
    }

    const jwt = await this.authService.getJwt(req.user as any);

    await this.authService.createSession(req.user.username);

    return jwt;
  }

  @Post('deposit')
  @UseGuards(new JwtAuthGuard(BUYER))
  async deposit(@Body() dto: DepositDto, @Request() req) {
    if (dto.value === undefined) {
      throw new BadRequestException(required('value'));
    }
    if (typeof dto.value !== 'number') {
      throw new BadRequestException(shouldBeNumber('value'));
    }

    const supportedCoins = AppConfig.SUPPORTED_COINS;
    const isValueSupported = supportedCoins.includes(dto.value);
    if (!isValueSupported) {
      throw new BadRequestException(
        `value (${dto.value}) is not supported. Should be one of: ${supportedCoins}.`,
      );
    }

    return await this.userService.depositToAccount(req.user.id, dto.value);
  }

  @Post('buy')
  @UseGuards(new JwtAuthGuard(BUYER))
  async buy(@Body() dto: BuyDto, @Request() req) {
    if (dto.products === undefined) {
      throw new BadRequestException(required('products'));
    }
    if (!Array.isArray(dto.products)) {
      throw new BadRequestException('products should be an array.');
    }
    if (dto.products.length === 0) {
      throw new BadRequestException(
        'products should have at least 1 product to buy.',
      );
    }
    if (!req || !req.user || !req.user.id) {
      throw new BadRequestException(required('userId'));
    }

    try {
      return await this.productService.buyProducts(req.user.id, dto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('reset')
  @UseGuards(new JwtAuthGuard(BUYER))
  async resetDeposit(@Request() req) {
    return await this.userService.resetDeposit(req.user.id);
  }

  @Get('coins')
  @UseGuards(JwtAuthGuard)
  async getUserCoins(@Request() req) {
    const user = await this.userService.findById(req.user.id);
    if (!user) {
      throw new NotFoundException(notFound(`User ID (${req.user.id})`));
    }
    try {
      return await numberToCoinsCounts(user.deposit);
    } catch (error) {
      throw new BadGatewayException(error.message);
    }
  }
}
