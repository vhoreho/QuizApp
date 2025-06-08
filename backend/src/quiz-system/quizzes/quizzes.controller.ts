import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  UseGuards,
  ParseIntPipe,
  Query,
  Patch,
  Request,
  Logger,
} from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { Quiz } from './entities/quiz.entity';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UpdateQuizStatusDto } from './dto/update-quiz-status.dto';

@Controller('quizzes')
export class QuizzesController {
  private readonly logger = new Logger(QuizzesController.name);

  constructor(private readonly quizzesService: QuizzesService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createQuizDto: CreateQuizDto, @Request() req) {
    this.logger.debug(`Received quiz creation request with data: ${JSON.stringify(createQuizDto)}`);
    this.logger.debug(`User ID from request: ${req.user.id}`);

    try {
      const quiz = await this.quizzesService.create(createQuizDto, req.user.id);
      this.logger.debug(`Successfully created quiz with ID: ${quiz.id}`);
      return quiz;
    } catch (error) {
      this.logger.error(`Error creating quiz: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query('withDetails') withDetails: boolean, @Req() req: any) {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Фильтрация тестов в зависимости от роли пользователя
    if (userRole === UserRole.ADMIN) {
      // Администраторы видят все тесты
      return this.quizzesService.findAllWithDetails(withDetails, null, null, true);
    } else if (userRole === UserRole.TEACHER) {
      // Преподаватели видят только свои тесты
      return this.quizzesService.findAllWithDetails(withDetails, userId, null, false);
    } else {
      // Студенты видят только опубликованные тесты
      return this.quizzesService.findAllWithDetails(withDetails, null, true, false);
    }
  }

  @Get('homepage')
  @UseGuards(JwtAuthGuard)
  getHomepageData(@Req() req: any) {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    return this.quizzesService.getHomepageData(userId, userRole);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.quizzesService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateQuizStatusDto: UpdateQuizStatusDto,
    @Req() req: any,
  ) {
    // В будущем можно добавить проверку владельца теста
    return this.quizzesService.updateStatus(id, updateQuizStatusDto);
  }

  @Post(':id/submit')
  @UseGuards(JwtAuthGuard)
  submitQuiz(
    @Param('id', ParseIntPipe) id: number,
    @Body() submitQuizDto: SubmitQuizDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id;
    return this.quizzesService.submitQuiz(id, submitQuizDto, userId);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  getUserQuizzes(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('withDetails') withDetails: boolean,
    @Req() req: any,
  ) {
    const requestingUserId = req.user?.id;
    const userRole = req.user?.role;

    // Если пользователь запрашивает свои собственные тесты или это админ
    if (userId === requestingUserId || userRole === UserRole.ADMIN) {
      return this.quizzesService.findAllWithDetails(
        withDetails,
        userId,
        null,
        userRole === UserRole.ADMIN,
      );
    } else if (userRole === UserRole.TEACHER) {
      // Преподаватели могут видеть только опубликованные тесты других преподавателей
      return this.quizzesService.findAllWithDetails(withDetails, userId, true, false);
    } else {
      // Студенты могут видеть только опубликованные тесты
      return this.quizzesService.findAllWithDetails(withDetails, userId, true, false);
    }
  }
}
