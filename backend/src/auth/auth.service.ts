import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { comparePassword } from '../utils/utils';
import UserEntity from '../entities/user.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userService.findByUsername(username, true);
    if (user && (await comparePassword(password, user.password))) {
      const { password, ...others } = user;
      return others;
    }
    return null;
  }

  async getJwt(user: UserEntity) {
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async createSession(username: string) {
    return await this.userService.createSession(username);
  }
}
