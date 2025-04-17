import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { Quiz } from './entities/quiz.entity';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  create(@Body() createQuizDto: CreateQuizDto, @Request() req): Promise<Quiz> {
    const userId = req.user?.id || 1; // For testing, we'll use userId 1 if no auth
    return this.quizzesService.create(createQuizDto, userId);
  }

  @Get()
  findAll(): Promise<Quiz[]> {
    return this.quizzesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Quiz> {
    return this.quizzesService.findOne(+id);
  }

  @Post(':id/submit')
  submitQuiz(@Param('id') id: string, @Body() submitQuizDto: SubmitQuizDto, @Request() req) {
    const userId = req.user?.id || 1; // For testing, we'll use userId 1 if no auth
    return this.quizzesService.submitQuiz(+id, submitQuizDto, userId);
  }
} 