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
    const userId = req.user?.id;
    return this.quizzesService.create(createQuizDto, userId);
  }

  @Get()
  findAll(@Query('withDetails') withDetails: boolean) {
    return this.quizzesService.findAllWithDetails(withDetails);
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
} 