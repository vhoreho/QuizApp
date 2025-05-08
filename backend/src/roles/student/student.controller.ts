import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { QuizzesService } from '../../quiz-system/quizzes/quizzes.service';
import { QuestionsService } from '../../quiz-system/questions/questions.service';
import { ResultsService } from '../../quiz-system/results/results.service';
import { SubmitQuizDto } from '../../quiz-system/quizzes/dto/submit-quiz.dto';

@Controller('student')
@UseGuards(JwtAuthGuard)
export class StudentController {
  constructor(
    private readonly quizzesService: QuizzesService,
    private readonly questionsService: QuestionsService,
    private readonly resultsService: ResultsService,
  ) {}

  // Available quizzes
  @Get('quizzes')
  findAvailableQuizzes() {
    console.log('🚀 ~ StudentController ~ findAvailableQuizzes ~ finding available quizzes');
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
  submitQuiz(@Param('id') id: string, @Body() submitQuizDto: SubmitQuizDto, @Request() req) {
    const userId = req.user.id;
    return this.quizzesService.submitQuiz(+id, submitQuizDto, userId);
  }

  // Check if student has already taken a quiz
  @Get('quizzes/:id/has-taken')
  async hasUserTakenQuiz(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    const hasTaken = await this.resultsService.hasUserTakenQuiz(userId, +id);
    return { hasTaken };
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

  @Get('results/:id/answers')
  async getResultAnswers(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    const result = await this.resultsService.findOne(+id);

    // Проверяем, принадлежит ли результат текущему пользователю
    if (result.userId !== userId) {
      return { error: 'Нет доступа к этому результату' };
    }

    // Получаем все ответы пользователя для данного теста
    const answers = await this.resultsService.getAnswersByResultId(+id);
    return {
      result,
      answers,
    };
  }

  @Get('dashboard')
  getStudentDashboard(@Request() req) {
    const userId = req.user.id;
    return this.resultsService.getStudentPerformance(userId);
  }
}
