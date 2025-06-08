import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Patch,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { UsersService } from '../../users/users.service';
import { QuizzesService } from '../../quiz-system/quizzes/quizzes.service';
import { ResultsService } from '../../quiz-system/results/results.service';
import { QuestionsService } from '../../quiz-system/questions/questions.service';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { CreateQuizDto } from '../../quiz-system/quizzes/dto/create-quiz.dto';
import { CreateQuestionDto } from '../../quiz-system/questions/dto/create-question.dto';
import { UpdateQuizStatusDto } from '../../quiz-system/quizzes/dto/update-quiz-status.dto';
import { UpdateQuizDto } from '../../quiz-system/quizzes/dto/update-quiz.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(
    private readonly usersService: UsersService,
    private readonly quizzesService: QuizzesService,
    private readonly resultsService: ResultsService,
    private readonly questionsService: QuestionsService,
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

  @Post('quizzes')
  createQuiz(@Body() createQuizDto: CreateQuizDto, @Request() req) {
    const adminId = req.user.id;
    return this.quizzesService.create(createQuizDto, adminId);
  }

  @Get('quizzes/:id')
  findQuizById(@Param('id') id: string) {
    return this.quizzesService.findOne(+id);
  }

  @Patch('quizzes/:id/status')
  updateQuizStatus(@Param('id') id: string, @Body() updateQuizStatusDto: UpdateQuizStatusDto) {
    return this.quizzesService.updateStatus(+id, updateQuizStatusDto);
  }

  @Post('quizzes/:quizId/questions')
  addQuestion(@Param('quizId') quizId: string, @Body() createQuestionDto: CreateQuestionDto) {
    return this.questionsService.create(+quizId, createQuestionDto);
  }

  @Delete('quizzes/:id')
  removeQuiz(@Param('id') id: string) {
    return this.quizzesService.remove(+id);
  }

  @Patch('quizzes/:id')
  updateQuiz(@Param('id') id: string, @Body() updateQuizDto: UpdateQuizDto, @Request() req) {
    const adminId = req.user.id;
    return this.quizzesService.update(+id, updateQuizDto, adminId);
  }

  // Quiz results endpoints
  @Get('quizzes/:id/results')
  getQuizResults(@Param('id') id: string) {
    return this.resultsService.findByQuizId(+id);
  }

  @Get('quizzes/:id/statistics')
  getQuizStatistics(@Param('id') id: string) {
    return this.getQuizStats(+id);
  }

  @Get('results')
  getAllResults(
    @Query('username') username?: string,
    @Query('quizTitle') quizTitle?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('includePractice') includePractice?: boolean,
  ) {
    return this.resultsService.findAll({
      username,
      quizTitle,
      dateFrom,
      dateTo,
      includePractice,
    });
  }

  private async getQuizStats(quizId: number) {
    const results = await this.resultsService.findByQuizId(quizId, false);
    const averageScore = await this.resultsService.getAverageScoreByQuiz(quizId, false);

    const scores = results.map((result) => result.score);
    const passRate = (scores.filter((score) => score >= 6).length / (scores.length || 1)) * 100;

    // Calculate score distribution
    const distribution = {
      '0-2': 0,
      '2.1-4': 0,
      '4.1-6': 0,
      '6.1-8': 0,
      '8.1-10': 0,
    };

    scores.forEach((score) => {
      if (score <= 2) distribution['0-2']++;
      else if (score <= 4) distribution['2.1-4']++;
      else if (score <= 6) distribution['4.1-6']++;
      else if (score <= 8) distribution['6.1-8']++;
      else distribution['8.1-10']++;
    });

    return {
      totalParticipants: results.length,
      averageScore,
      passRate,
      highestScore: Math.max(...(scores.length ? scores : [0])),
      lowestScore: Math.min(...(scores.length ? scores : [10])),
      distribution,
    };
  }

  // Dashboard statistics
  @Get('stats')
  getDashboardStats(
    @Query('excludeCurrentUser') excludeCurrentUser: boolean,
    @Query('publishedOnly') publishedOnly: boolean,
    @Req() request,
  ) {
    const userId = request.user?.id;
    return this.getSystemStats(
      excludeCurrentUser === true ? userId : undefined,
      publishedOnly === true,
    );
  }

  private async getSystemStats(excludeUserId?: number, publishedOnly: boolean = false) {
    const userCount = await this.usersService.count(excludeUserId);
    const quizCount = await this.quizzesService.count(publishedOnly);
    const resultCount = await this.resultsService.count();
    const usersByRole = await this.usersService.countByRole(excludeUserId);

    return {
      userCount,
      quizCount,
      resultCount,
      usersByRole,
      recentUsers: await this.usersService.findRecent(5, excludeUserId),
      recentQuizzes: await this.quizzesService.findRecent(5, publishedOnly),
    };
  }
}
