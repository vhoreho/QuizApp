import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { QuizzesModule } from './quizzes/quizzes.module';
import { QuestionsModule } from './questions/questions.module';
import { ResultsModule } from './results/results.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [
    UsersModule,
    QuizzesModule,
    QuestionsModule,
    ResultsModule,
    CategoriesModule,
  ],
  exports: [
    QuizzesModule,
    QuestionsModule,
    ResultsModule,
    CategoriesModule,
  ],
})
export class QuizSystemModule { }
