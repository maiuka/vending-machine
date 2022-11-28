import { Injectable } from '@nestjs/common';
import { StoreService } from '../store/store.service';
import UserEntity from '../entities/user.entity';
import CreateUserDto from '../dtos/create-user.dto';
import UpdateUserDto from '../dtos/update-user.dto';
import { UsernameExists } from '../exceptions/user.exceptions';

@Injectable()
export class UserService {
  constructor(private storeService: StoreService) {}

  async create(dto: CreateUserDto) {
    if (await this.findByUsername(dto.username)) {
      throw new UsernameExists(dto.username);
    }

    return await this.storeService.createUser(dto);
  }

  async findAll() {
    return this.storeService.findAllUsers();
  }

  async findById(id: string): Promise<UserEntity | undefined> {
    return await this.storeService.findUserById(id);
  }

  async findByUsername(
    username: string,
    includePassword?: boolean,
  ): Promise<UserEntity | undefined> {
    return await this.storeService.findUserByUsername(
      username,
      includePassword,
    );
  }

  async update(id: string, dto: UpdateUserDto) {
    return await this.storeService.updateUser(id, dto);
  }

  async remove(id: string) {
    return await this.storeService.removeUser(id);
  }

  async depositToAccount(userId: string, depositValue: number) {
    return await this.storeService.depositToUserAccount(userId, depositValue);
  }

  async resetDeposit(id: string) {
    return await this.storeService.resetUserDeposit(id);
  }

  async createSession(username: string) {
    return await this.storeService.createUserSession(username);
  }
}
