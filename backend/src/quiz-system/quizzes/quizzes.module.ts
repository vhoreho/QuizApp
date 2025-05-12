import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizzesController } from './quizzes.controller';
import { QuizzesService } from './quizzes.service';
import { Quiz } from './entities/quiz.entity';
import { UsersModule } from '../../users/users.module';
import { ResultsModule } from '../results/results.module';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Quiz]),
    UsersModule,
    ResultsModule,
    CategoriesModule
  ],
  controllers: [QuizzesController],
  providers: [QuizzesService],
  exports: [QuizzesService],
})
export class QuizzesModule { }
