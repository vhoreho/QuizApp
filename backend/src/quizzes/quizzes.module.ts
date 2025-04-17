import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizzesController } from './quizzes.controller';
import { QuizzesService } from './quizzes.service';
import { Quiz } from './entities/quiz.entity';
import { UsersModule } from '../users/users.module';
import { QuestionsModule } from '../questions/questions.module';
import { ResultsModule } from '../results/results.module';
import { Question } from 'src/questions/entities/question.entity';
import { Result } from 'src/results/entities/result.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Quiz, Question, Result]),
    UsersModule,
    QuestionsModule,
    ResultsModule,
  ],
  controllers: [QuizzesController],
  providers: [QuizzesService],
  exports: [QuizzesService],
})
export class QuizzesModule { } 