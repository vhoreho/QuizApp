import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { QuizzesModule } from './quizzes/quizzes.module';
import { QuestionsModule } from './questions/questions.module';
import { ResultsModule } from './results/results.module';
import { SubjectsModule } from './subjects/subjects.module';

@Module({
  imports: [
    UsersModule,
    QuizzesModule,
    QuestionsModule,
    ResultsModule,
    SubjectsModule,
  ],
  exports: [
    QuizzesModule,
    QuestionsModule,
    ResultsModule,
    SubjectsModule,
  ],
})
export class QuizSystemModule { }
