import { Result } from '../entities/result.entity';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class ResultResponseDto {
  id: number;
  quizId: number;
  userId: number;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  totalPoints: number;
  maxPossiblePoints: number;
  createdAt: string;
  isPractice: boolean;

  // Добавляем связанные данные в безопасном формате
  user?: UserResponseDto;
  quiz?: {
    id: number;
    title: string;
    description: string;
    isPublished: boolean;
  };

  constructor(partial: Partial<ResultResponseDto>) {
    Object.assign(this, partial);
  }

  static fromEntity(result: Result): ResultResponseDto {
    const dto = new ResultResponseDto({
      id: result.id,
      quizId: result.quizId,
      userId: result.userId,
      score: result.score,
      correctAnswers: result.correctAnswers,
      totalQuestions: result.totalQuestions,
      totalPoints: result.totalPoints,
      maxPossiblePoints: result.maxPossiblePoints,
      createdAt: result.createdAt?.toISOString(),
      isPractice: result.isPractice || false,
    });

    // Безопасное копирование связанных данных
    if (result.user) {
      dto.user = UserResponseDto.fromEntity(result.user);
    }

    if (result.quiz) {
      dto.quiz = {
        id: result.quiz.id,
        title: result.quiz.title,
        description: result.quiz.description,
        isPublished: result.quiz.isPublished,
      };
    }

    return dto;
  }
} 