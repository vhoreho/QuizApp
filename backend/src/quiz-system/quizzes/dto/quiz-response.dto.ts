import { Quiz } from '../entities/quiz.entity';
import { UserResponseDto } from '../../../users/dto/user-response.dto';

export class QuizResponseDto {
  id: number;
  title: string;
  description: string;
  isPublished: boolean;
  createdById: number;

  // Безопасные связанные данные
  createdBy?: UserResponseDto;
  questionsCount?: number;

  constructor(partial: Partial<QuizResponseDto>) {
    Object.assign(this, partial);
  }

  static fromEntity(quiz: Quiz, includeCreator: boolean = true): QuizResponseDto {
    const dto = new QuizResponseDto({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      isPublished: quiz.isPublished,
      createdById: quiz.createdById,
    });

    // Добавляем количество вопросов, если они загружены
    if (quiz.questions) {
      dto.questionsCount = quiz.questions.length;
    }

    // Безопасно добавляем информацию о создателе, если она загружена и требуется
    if (includeCreator && quiz.createdBy) {
      dto.createdBy = UserResponseDto.fromEntity(quiz.createdBy);
    }

    return dto;
  }
}
