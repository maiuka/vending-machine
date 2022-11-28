import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  BadRequestException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import CreateUserDto from '../dtos/create-user.dto';
import { UserService } from './user.service';
import { notFound, required } from '../utils/message-utils';
import { UsernameExists } from '../exceptions/user.exceptions';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // This endpoint is public to support user registration.
  @Post()
  async create(@Body() dto: CreateUserDto) {
    if (!dto.username) {
      throw new BadRequestException(required('username'));
    }
    if (!dto.password) {
      throw new BadRequestException(required('password'));
    }
    if (!dto.role) {
      throw new BadRequestException(required('role'));
    }

    try {
      return await this.userService.create(dto);
    } catch (error) {
      if (error instanceof UsernameExists) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    return await this.userService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findById(@Param('id') id: string) {
    const user = await this.userService.findById(id);
    if (!user) {
      throw new NotFoundException(notFound(`User ID (${id})`));
    }
    return user;
  }
}
