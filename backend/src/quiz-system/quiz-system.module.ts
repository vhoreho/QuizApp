import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizzesController } from './quizzes/quizzes.controller';
import { QuizzesService } from './quizzes/quizzes.service';
import { QuestionsController } from './questions/questions.controller';
import { QuestionsService } from './questions/questions.service';
import { AnswersController } from './answers/answers.controller';
import { AnswersService } from './answers/answers.service';
import { ResultsController } from './results/results.controller';
import { ResultsService } from './results/results.service';
import { Quiz } from './quizzes/entities/quiz.entity';
import { Question } from './questions/entities/question.entity';
import { Answer } from './answers/entities/answer.entity';
import { Result } from './results/entities/result.entity';
import { UsersModule } from '../users/users.module';
import { QuizzesModule } from './quizzes/quizzes.module';
import { QuestionsModule } from './questions/questions.module';
import { ResultsModule } from './results/results.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Quiz, Question, Answer, Result]),
    UsersModule,
    QuizzesModule,
    QuestionsModule,
    ResultsModule,
    CategoriesModule,
  ],
  controllers: [QuizzesController, QuestionsController, AnswersController, ResultsController],
  providers: [QuizzesService, QuestionsService, AnswersService, ResultsService],
  exports: [QuizzesService, QuestionsService, AnswersService, ResultsService],
})
export class QuizSystemModule { }
