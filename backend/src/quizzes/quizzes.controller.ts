import { Controller, Get, Post, Body, Param, Delete, Req, UseGuards, ParseIntPipe, Query, Patch } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { Quiz } from './entities/quiz.entity';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateQuizStatusDto } from './dto/update-quiz-status.dto';

@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  create(@Body() createQuizDto: CreateQuizDto, @Req() req: any) {
    try {
      console.log("🚀 ~ QuizzesController ~ create ~ request received");

      // Log the questions' options and values for debugging
      if (createQuizDto.questions && createQuizDto.questions.length > 0) {
        createQuizDto.questions.forEach((q, idx) => {
          console.log(`Question ${idx + 1} - Type: ${q.type}`);
          if (q.options && Array.isArray(q.options)) {
            console.log(`Options (${q.options.length}): ${JSON.stringify(q.options)}`);
          }
          if (q.type === 'MULTIPLE_CHOICE' && q.correctAnswers && Array.isArray(q.correctAnswers)) {
            console.log(`CorrectAnswers (${q.correctAnswers.length}): ${JSON.stringify(q.correctAnswers)}`);
          }
        });
      }

      const userId = req.user?.id;
      if (!userId) {
        const error = new Error('User ID not found in request');
        console.error("❌ ~ QuizzesController ~ create ~ error:", error.message);
        throw error;
      }

      // Print auth details for debugging
      console.log("🔐 ~ QuizzesController ~ create ~ auth headers:", req.headers.authorization?.substring(0, 20) + '...');

      return this.quizzesService.create(createQuizDto, userId);
    } catch (error) {
      console.error("❌ ~ QuizzesController ~ create ~ error:", error.message);
      console.error("Stack trace:", error.stack);
      throw error;
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @Query('withDetails') withDetails: boolean,
    @Req() req: any
  ) {
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
  getHomepageQuizzes(@Req() req: any) {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Для разных ролей разная логика получения тестов
    if (userRole === UserRole.ADMIN) {
      // Админы видят последние созданные тесты (с ограничением по количеству)
      return this.quizzesService.getRecentQuizzes(5, false);
    } else if (userRole === UserRole.TEACHER) {
      // Преподаватели видят свои последние тесты
      return this.quizzesService.findAllWithDetails(true, userId, null, false);
    } else {
      // Студенты видят последние опубликованные тесты
      return this.quizzesService.getRecentQuizzes(5, true);
    }
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
    @Req() req: any
  ) {
    // В будущем можно добавить проверку владельца теста
    return this.quizzesService.updateStatus(id, updateQuizStatusDto);
  }

  @Post(':id/submit')
  @UseGuards(JwtAuthGuard)
  submitQuiz(
    @Param('id', ParseIntPipe) id: number,
    @Body() submitQuizDto: SubmitQuizDto,
    @Req() req: any
  ) {
    const userId = req.user?.id;
    return this.quizzesService.submitQuiz(id, submitQuizDto, userId);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  getUserQuizzes(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('withDetails') withDetails: boolean,
    @Req() req: any
  ) {
    const requestingUserId = req.user?.id;
    const userRole = req.user?.role;

    // Если пользователь запрашивает свои собственные тесты или это админ
    if (userId === requestingUserId || userRole === UserRole.ADMIN) {
      return this.quizzesService.findAllWithDetails(withDetails, userId, null, userRole === UserRole.ADMIN);
    } else if (userRole === UserRole.TEACHER) {
      // Преподаватели могут видеть только опубликованные тесты других преподавателей
      return this.quizzesService.findAllWithDetails(withDetails, userId, true, false);
    } else {
      // Студенты могут видеть только опубликованные тесты
      return this.quizzesService.findAllWithDetails(withDetails, userId, true, false);
    }
  }
} 