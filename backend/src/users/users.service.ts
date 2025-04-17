import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  async findByUsername(username: string): Promise<User> {
    return this.usersRepository.findOne({ where: { username } });
  }

  // New methods for admin functionality
  async updateUserRole(id: number, role: UserRole): Promise<User> {
    const user = await this.findOne(id);
    user.role = role;
    return this.usersRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }

  async count(): Promise<number> {
    return this.usersRepository.count();
  }

  async countByRole(): Promise<Record<UserRole, number>> {
    const roles = Object.values(UserRole);
    const counts = await Promise.all(
      roles.map(async (role) => {
        const count = await this.usersRepository.count({ where: { role } });
        return { role, count };
      })
    );

    return counts.reduce((acc, { role, count }) => {
      acc[role] = count;
      return acc;
    }, {} as Record<UserRole, number>);
  }

  async findRecent(limit: number): Promise<User[]> {
    return this.usersRepository.find({
      order: { id: 'DESC' },
      take: limit,
    });
  }
} 