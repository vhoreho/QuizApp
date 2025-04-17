import { Module } from '@nestjs/common';
import { StudentController } from './student.controller';
import { QuizzesModule } from '../quizzes/quizzes.module';
import { QuestionsModule } from '../questions/questions.module';
import { ResultsModule } from '../results/results.module';

@Module({
  imports: [
    QuizzesModule,
    QuestionsModule,
    ResultsModule,
  ],
  controllers: [StudentController],
})
export class StudentModule { } 