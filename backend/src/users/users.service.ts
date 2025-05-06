import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const user = this.usersRepository.create(createUserDto);
    const savedUser = await this.usersRepository.save(user);
    return UserResponseDto.fromEntity(savedUser);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersRepository.find();
    return users.map(user => UserResponseDto.fromEntity(user));
  }

  async findOne(id: number): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return UserResponseDto.fromEntity(user);
  }

  async findByUsername(username: string): Promise<User> {
    return this.usersRepository.findOne({ where: { username } });
  }

  // New methods for admin functionality
  async updateUserRole(id: number, role: UserRole): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    user.role = role;
    const updatedUser = await this.usersRepository.save(user);
    return UserResponseDto.fromEntity(updatedUser);
  }

  async remove(id: number): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    await this.usersRepository.remove(user);
  }

  async count(excludeUserId?: number): Promise<number> {
    if (excludeUserId) {
      return this.usersRepository.count({
        where: { id: Not(excludeUserId) }
      });
    }
    return this.usersRepository.count();
  }

  async countByRole(excludeUserId?: number): Promise<Record<UserRole, number>> {
    const roles = Object.values(UserRole);
    const counts = await Promise.all(
      roles.map(async (role) => {
        let whereClause: any = { role };
        if (excludeUserId) {
          whereClause = { role, id: Not(excludeUserId) };
        }
        const count = await this.usersRepository.count({ where: whereClause });
        return { role, count };
      })
    );

    return counts.reduce((acc, { role, count }) => {
      acc[role] = count;
      return acc;
    }, {} as Record<UserRole, number>);
  }

  async findRecent(limit: number, excludeUserId?: number): Promise<UserResponseDto[]> {
    let queryBuilder = this.usersRepository.createQueryBuilder('user');

    if (excludeUserId) {
      queryBuilder = queryBuilder.where('user.id != :excludeUserId', { excludeUserId });
    }

    const users = await queryBuilder
      .orderBy('user.id', 'DESC')
      .take(limit)
      .getMany();

    return users.map(user => UserResponseDto.fromEntity(user));
  }
} 