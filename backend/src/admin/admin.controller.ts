import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { QuizzesService } from '../quizzes/quizzes.service';
import { ResultsService } from '../results/results.service';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(
    private readonly usersService: UsersService,
    private readonly quizzesService: QuizzesService,
    private readonly resultsService: ResultsService
  ) { }

  // User management endpoints
  @Get('users')
  findAllUsers() {
    return this.usersService.findAll();
  }

  @Get('users/:id')
  findUserById(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Put('users/:id/role')
  updateUserRole(@Param('id') id: string, @Body() updateUserRoleDto: UpdateUserRoleDto) {
    return this.usersService.updateUserRole(+id, updateUserRoleDto.role);
  }

  @Delete('users/:id')
  removeUser(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  // Quiz management endpoints
  @Get('quizzes')
  findAllQuizzes(@Query('withDetails') withDetails: boolean) {
    return this.quizzesService.findAllWithDetails(withDetails);
  }

  @Get('quizzes/:id')
  findQuizById(@Param('id') id: string) {
    return this.quizzesService.findOne(+id);
  }

  @Delete('quizzes/:id')
  removeQuiz(@Param('id') id: string) {
    return this.quizzesService.remove(+id);
  }

  // Dashboard statistics
  @Get('stats')
  getDashboardStats() {
    return this.getSystemStats();
  }

  private async getSystemStats() {
    const userCount = await this.usersService.count();
    const quizCount = await this.quizzesService.count();
    const resultCount = await this.resultsService.count();
    const usersByRole = await this.usersService.countByRole();

    return {
      userCount,
      quizCount,
      resultCount,
      usersByRole,
      recentUsers: await this.usersService.findRecent(5),
      recentQuizzes: await this.quizzesService.findRecent(5),
    };
  }
} 