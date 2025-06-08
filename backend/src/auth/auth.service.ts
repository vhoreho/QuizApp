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
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id, role: user.role };

    // Исключаем чувствительные данные с помощью DTO
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
    // Check if creator is admin
    if (creatorRole !== UserRole.ADMIN) {
      throw new UnauthorizedException('Only administrators can create user accounts');
    }

    // Hash the password
    userData.password = await this.hashPassword(userData.password);

    // Create the user and return safe user data
    const user = await this.usersService.create(userData);
    return user; // Уже безопасный объект благодаря использованию UserResponseDto в сервисе
  }
}
