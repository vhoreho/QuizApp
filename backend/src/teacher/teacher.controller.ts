import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Request } from '@nestjs/common';
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
  getQuizResults(@Param('id') id: string) {
    return this.resultsService.findByQuizId(+id);
  }

  @Get('quizzes/:id/statistics')
  getQuizStatistics(@Param('id') id: string) {
    return this.getQuizStats(+id);
  }

  private async getQuizStats(quizId: number) {
    const results = await this.resultsService.findByQuizId(quizId);
    const averageScore = await this.resultsService.getAverageScoreByQuiz(quizId);

    const scores = results.map(result => result.score);
    const passRate = scores.filter(score => score >= 60).length / (scores.length || 1) * 100;

    // Calculate score distribution
    const distribution = {
      '0-20': 0,
      '21-40': 0,
      '41-60': 0,
      '61-80': 0,
      '81-100': 0,
    };

    scores.forEach(score => {
      if (score <= 20) distribution['0-20']++;
      else if (score <= 40) distribution['21-40']++;
      else if (score <= 60) distribution['41-60']++;
      else if (score <= 80) distribution['61-80']++;
      else distribution['81-100']++;
    });

    return {
      totalParticipants: results.length,
      averageScore,
      passRate,
      highestScore: Math.max(...(scores.length ? scores : [0])),
      lowestScore: Math.min(...(scores.length ? scores : [100])),
      distribution,
    };
  }
} 