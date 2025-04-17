import { Module } from '@nestjs/common';
import { TeacherController } from './teacher.controller';
import { QuizzesModule } from '../quizzes/quizzes.module';
import { QuestionsModule } from '../questions/questions.module';
import { ResultsModule } from '../results/results.module';

@Module({
  imports: [
    QuizzesModule,
    QuestionsModule,
    ResultsModule,
  ],
  controllers: [TeacherController],
})
export class TeacherModule { } 