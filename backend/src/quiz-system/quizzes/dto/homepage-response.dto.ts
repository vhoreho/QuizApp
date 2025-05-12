import { QuizResponseDto } from './quiz-response.dto';
import { CategoryResponseDto } from '../../categories/dto/category-response.dto';
import { ResultResponseDto } from '../../results/dto/result-response.dto';
import { UserRole } from '../../../users/entities/user.entity';

export class HomepageResponseDto {
  userRole: UserRole;
  quizzes: QuizResponseDto[];
  categories: CategoryResponseDto[];
  stats: {
    totalQuizzes?: number;
    totalUsers?: number;
    totalCategories?: number;
    averageScore?: number;
    recentResults?: ResultResponseDto[];
  };

  constructor(partial: Partial<HomepageResponseDto>) {
    Object.assign(this, partial);
  }
} 