import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { QuizzesService } from '../quizzes/quizzes.service';
import { QuestionsService } from '../questions/questions.service';
import { ResultsService } from '../results/results.service';
import { SubmitQuizDto } from '../quizzes/dto/submit-quiz.dto';

@Controller('student')
@UseGuards(JwtAuthGuard)
export class StudentController {
  constructor(
    private readonly quizzesService: QuizzesService,
    private readonly questionsService: QuestionsService,
    private readonly resultsService: ResultsService,
  ) { }

  // Available quizzes
  @Get('quizzes')
  findAvailableQuizzes() {
    return this.quizzesService.findAll();
  }

  @Get('quizzes/:id')
  findQuizById(@Param('id') id: string) {
    return this.quizzesService.findOne(+id);
  }

  @Get('quizzes/:id/questions')
  getQuizQuestions(@Param('id') id: string) {
    return this.questionsService.findByQuizId(+id);
  }

  // Submit quiz
  @Post('quizzes/:id/submit')
  submitQuiz(
    @Param('id') id: string,
    @Body() submitQuizDto: SubmitQuizDto,
    @Request() req,
  ) {
    const userId = req.user.id;
    return this.quizzesService.submitQuiz(+id, submitQuizDto, userId);
  }

  // Results
  @Get('results')
  getMyResults(@Request() req) {
    const userId = req.user.id;
    return this.resultsService.findByUserId(userId);
  }

  @Get('results/:id')
  getResultById(@Param('id') id: string, @Request() req) {
    return this.resultsService.findOne(+id);
  }

  @Get('dashboard')
  getStudentDashboard(@Request() req) {
    const userId = req.user.id;
    return this.resultsService.getStudentPerformance(userId);
  }
} 