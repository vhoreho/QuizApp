import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { UsersModule } from '../users/users.module';
import { QuizzesModule } from '../quizzes/quizzes.module';
import { ResultsModule } from '../results/results.module';

@Module({
  imports: [
    UsersModule,
    QuizzesModule,
    ResultsModule,
  ],
  controllers: [AdminController],
})
export class AdminModule { } 