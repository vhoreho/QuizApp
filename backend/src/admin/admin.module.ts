import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { UsersModule } from '../users/users.module';
import { QuizzesModule } from '../quizzes/quizzes.module';
import { ResultsModule } from '../results/results.module';
import { QuestionsModule } from '../questions/questions.module';

@Module({
  imports: [
    UsersModule,
    QuizzesModule,
    ResultsModule,
    QuestionsModule,
  ],
  controllers: [AdminController],
})
export class AdminModule { } 