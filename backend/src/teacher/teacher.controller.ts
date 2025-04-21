import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Request, Patch, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { QuizzesService } from '../quizzes/quizzes.service';
import { QuestionsService } from '../questions/questions.service';
import { ResultsService } from '../results/results.service';
import { CreateQuizDto } from '../quizzes/dto/create-quiz.dto';
import { CreateQuestionDto } from '../questions/dto/create-question.dto';
import { UpdateQuestionDto } from '../questions/dto/update-question.dto';
import { UpdateQuizStatusDto } from '../quizzes/dto/update-quiz-status.dto';
import { UpdateQuizDto } from '../quizzes/dto/update-quiz.dto';

@Controller('teacher')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TEACHER)
export class TeacherController {
  constructor(
    private readonly quizzesService: QuizzesService,
    private readonly questionsService: QuestionsService,
    private readonly resultsService: ResultsService,
  ) { }

  // Quiz management
  @Get('quizzes')
  findMyQuizzes(@Request() req) {
    const teacherId = req.user.id;
    return this.quizzesService.findByTeacherId(teacherId);
  }

  @Post('quizzes')
  createQuiz(@Body() createQuizDto: CreateQuizDto, @Request() req) {
    const teacherId = req.user.id;
    return this.quizzesService.create(createQuizDto, teacherId);
  }

  @Get('quizzes/:id')
  findQuizById(@Param('id') id: string) {
    return this.quizzesService.findOne(+id);
  }

  @Delete('quizzes/:id')
  removeQuiz(@Param('id') id: string, @Request() req) {
    // Additional check could be added to ensure the teacher owns this quiz
    return this.quizzesService.remove(+id);
  }

  @Patch('quizzes/:id/status')
  updateQuizStatus(
    @Param('id') id: string,
    @Body() updateQuizStatusDto: UpdateQuizStatusDto,
    @Request() req
  ) {
    // Additional check could be added to ensure the teacher owns this quiz
    return this.quizzesService.updateStatus(+id, updateQuizStatusDto);
  }

  @Patch('quizzes/:id')
  updateQuiz(
    @Param('id') id: string,
    @Body() updateQuizDto: UpdateQuizDto,
    @Request() req
  ) {
    const teacherId = req.user.id;
    return this.quizzesService.update(+id, updateQuizDto, teacherId);
  }

  // Question management
  @Post('quizzes/:quizId/questions')
  addQuestion(
    @Param('quizId') quizId: string,
    @Body() createQuestionDto: CreateQuestionDto,
  ) {
    return this.questionsService.create(+quizId, createQuestionDto);
  }

  @Put('questions/:id')
  updateQuestion(
    @Param('id') id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ) {
    return this.questionsService.update(+id, updateQuestionDto);
  }

  @Delete('questions/:id')
  removeQuestion(@Param('id') id: string) {
    return this.questionsService.remove(+id);
  }

  // Quiz results
  @Get('quizzes/:id/results')
  getQuizResults(
    @Param('id') id: string,
    @Query('includePractice') includePractice?: boolean
  ) {
    return this.resultsService.findByQuizId(+id, includePractice);
  }

  @Get('quizzes/:id/statistics')
  getQuizStatistics(
    @Param('id') id: string,
    @Query('includePractice') includePractice?: boolean
  ) {
    return this.getQuizStats(+id, includePractice);
  }

  @Get('results')
  getMyResults(
    @Request() req,
    @Query('username') username?: string,
    @Query('quizTitle') quizTitle?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('includePractice') includePractice?: boolean,
  ) {
    const teacherId = req.user.id;
    return this.resultsService.findByTeacherId(teacherId, {
      username,
      quizTitle,
      dateFrom,
      dateTo,
      includePractice,
    });
  }

  private async getQuizStats(quizId: number, includePractice: boolean = false) {
    const results = await this.resultsService.findByQuizId(quizId, includePractice);
    const averageScore = await this.resultsService.getAverageScoreByQuiz(quizId, includePractice);

    const scores = results.map(result => result.score);
    const passRate = scores.filter(score => score >= 6).length / (scores.length || 1) * 100;

    // Calculate score distribution
    const distribution = {
      '0-2': 0,
      '2.1-4': 0,
      '4.1-6': 0,
      '6.1-8': 0,
      '8.1-10': 0,
    };

    scores.forEach(score => {
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
} 