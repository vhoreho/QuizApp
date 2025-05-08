import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizzesController } from './quizzes.controller';
import { QuizzesService } from './quizzes.service';
import { Quiz } from './entities/quiz.entity';
import { UsersModule } from '../../users/users.module';
import { ResultsModule } from '../results/results.module';
import { Question } from '../questions/entities/question.entity';
import { Result } from '../results/entities/result.entity';
import { QuestionsController } from '../questions/questions.controller';
import { QuestionsService } from '../questions/questions.service';
import { AnswersController } from '../answers/answers.controller';
import { AnswersService } from '../answers/answers.service';
import { Answer } from '../answers/entities/answer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Quiz, Question, Result, Answer]), UsersModule, ResultsModule],
  controllers: [QuizzesController, QuestionsController, AnswersController],
  providers: [QuizzesService, QuestionsService, AnswersService],
  exports: [QuizzesService, QuestionsService, AnswersService],
})
export class QuizzesModule { }
