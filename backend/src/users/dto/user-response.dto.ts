import { UserRole } from '../entities/user.entity';

export class UserResponseDto {
  id: number;
  username: string;
  name: string;
  email: string;
  role: UserRole;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }

  static fromEntity(user: any): UserResponseDto {
    // Исключаем чувствительные данные, такие как пароль
    const { password, ...userData } = user;
    return new UserResponseDto(userData);
  }
} 