import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizzesController } from './quizzes.controller';
import { QuizzesService } from './quizzes.service';
import { Quiz } from './entities/quiz.entity';
import { UsersModule } from '../../users/users.module';
import { ResultsModule } from '../results/results.module';
import { SubjectsModule } from '../subjects/subjects.module';
import { Result } from '../results/entities/result.entity';
import { QuestionsModule } from '../questions/questions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Quiz, Result]),
    UsersModule,
    ResultsModule,
    SubjectsModule,
    QuestionsModule
  ],
  controllers: [QuizzesController],
  providers: [QuizzesService],
  exports: [QuizzesService],
})
export class QuizzesModule { }
