import { Module } from '@nestjs/common';
import { QuizSystemModule } from '../quiz-system/quiz-system.module';
import { UsersModule } from '../users/users.module';
import { AdminController } from './admin/admin.controller';
import { TeacherController } from './teacher/teacher.controller';
import { StudentController } from './student/student.controller';

@Module({
  imports: [UsersModule, QuizSystemModule],
  controllers: [AdminController, TeacherController, StudentController],
})
export class RolesModule { }
