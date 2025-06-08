import { QuizResponseDto } from './quiz-response.dto';
import { SubjectResponseDto } from '../../subjects/dto/subject-response.dto';
import { ResultResponseDto } from '../../results/dto/result-response.dto';
import { UserRole } from '../../../users/entities/user.entity';

export class HomepageResponseDto {
  userRole: UserRole;
  quizzes: QuizResponseDto[];
  subjects: SubjectResponseDto[];
  stats: {
    totalQuizzes?: number;
    totalUsers?: number;
    totalSubjects?: number;
    averageScore?: number;
    recentResults?: ResultResponseDto[];
  };

  constructor(partial: Partial<HomepageResponseDto>) {
    Object.assign(this, partial);
  }
} 