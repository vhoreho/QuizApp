import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../users/entities/user.entity';
import { UserResponseDto } from '../users/dto/user-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  async validateUser(username: string, password: string): Promise<any> {
    try {
      const user = await this.usersService.findByUsername(username);

      if (!user) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (isPasswordValid) {
        const { password, ...result } = user;
        return result;
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id, role: user.role };
    const userResponse = UserResponseDto.fromEntity(user);

    return {
      access_token: this.jwtService.sign(payload),
      user: userResponse,
    };
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async createUser(userData: any, creatorRole: UserRole) {
    if (creatorRole !== UserRole.ADMIN) {
      throw new UnauthorizedException('Only administrators can create user accounts');
    }

    userData.password = await this.hashPassword(userData.password);
    const user = await this.usersService.create(userData);
    return user;
  }
}
