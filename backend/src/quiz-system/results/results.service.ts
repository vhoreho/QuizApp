import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Result } from './entities/result.entity';
import { ResultResponseDto } from './dto/result-response.dto';
import { Answer } from '../answers/entities/answer.entity';

@Injectable()
export class ResultsService {
  constructor(
    @InjectRepository(Result)
    private resultsRepository: Repository<Result>,
    @InjectRepository(Answer)
    private answersRepository: Repository<Answer>,
  ) {}

  async findAll(filters?: {
    username?: string;
    quizTitle?: string;
    dateFrom?: string;
    dateTo?: string;
    includePractice?: boolean;
  }): Promise<ResultResponseDto[]> {
    const query = this.resultsRepository
      .createQueryBuilder('result')
      .leftJoinAndSelect('result.user', 'user')
      .leftJoinAndSelect('result.quiz', 'quiz');

    // По умолчанию исключаем практические тесты, если не указано иное
    if (!filters?.includePractice) {
      query.andWhere('result.isPractice = :isPractice', { isPractice: false });
    }

    if (filters) {
      if (filters.username) {
        query.andWhere('LOWER(user.username) LIKE :username', {
          username: `%${filters.username.toLowerCase()}%`,
        });
      }

      if (filters.quizTitle) {
        query.andWhere('LOWER(quiz.title) LIKE :quizTitle', {
          quizTitle: `%${filters.quizTitle.toLowerCase()}%`,
        });
      }

      if (filters.dateFrom) {
        query.andWhere('result.createdAt >= :dateFrom', {
          dateFrom: new Date(filters.dateFrom),
        });
      }

      if (filters.dateTo) {
        // Добавляем 1 день к дате, чтобы включить весь последний день
        const dateTo = new Date(filters.dateTo);
        dateTo.setDate(dateTo.getDate() + 1);
        query.andWhere('result.createdAt < :dateTo', { dateTo });
      }
    }

    const results = await query.orderBy('result.createdAt', 'DESC').getMany();
    return results.map((result) => ResultResponseDto.fromEntity(result));
  }

  async findOne(id: number): Promise<ResultResponseDto> {
    const result = await this.resultsRepository.findOne({
      where: { id },
      relations: ['user', 'quiz'],
    });

    if (!result) {
      throw new NotFoundException(`Result with ID ${id} not found`);
    }

    return ResultResponseDto.fromEntity(result);
  }

  async findByUserId(userId: number): Promise<ResultResponseDto[]> {
    const results = await this.resultsRepository.find({
      where: { userId },
      relations: ['quiz'],
      order: { id: 'DESC' },
    });

    return results.map((result) => ResultResponseDto.fromEntity(result));
  }

  async findByQuizId(
    quizId: number,
    includePractice: boolean = false,
  ): Promise<ResultResponseDto[]> {
    const queryBuilder = this.resultsRepository
      .createQueryBuilder('result')
      .leftJoinAndSelect('result.user', 'user')
      .where('result.quizId = :quizId', { quizId });

    if (!includePractice) {
      queryBuilder.andWhere('result.isPractice = :isPractice', { isPractice: false });
    }

    const results = await queryBuilder.orderBy('result.score', 'DESC').getMany();
    return results.map((result) => ResultResponseDto.fromEntity(result));
  }

  async count(): Promise<number> {
    return this.resultsRepository.count();
  }

  async getAverageScoreByQuiz(quizId: number, includePractice: boolean = false): Promise<number> {
    const queryBuilder = this.resultsRepository
      .createQueryBuilder('result')
      .where('result.quizId = :quizId', { quizId });

    if (!includePractice) {
      queryBuilder.andWhere('result.isPractice = :isPractice', { isPractice: false });
    }

    const results = await queryBuilder.getMany();
    if (results.length === 0) return 0;

    const sum = results.reduce((acc, result) => acc + result.score, 0);
    return sum / results.length;
  }

  async getStudentPerformance(userId: number): Promise<any> {
    const results = await this.findByUserId(userId);

    if (results.length === 0) {
      return {
        totalQuizzes: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        quizzesPassed: 0,
      };
    }

    const totalQuizzes = results.length;
    const scores = results.map((result) => result.score);
    const averageScore = scores.reduce((a, b) => a + b, 0) / totalQuizzes;
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    const quizzesPassed = scores.filter((score) => score >= 6).length;

    return {
      totalQuizzes,
      averageScore,
      highestScore,
      lowestScore,
      quizzesPassed,
      recentResults: results.slice(0, 5),
    };
  }

  async findByUserAndQuiz(userId: number, quizId: number): Promise<ResultResponseDto> {
    const result = await this.resultsRepository.findOne({
      where: { userId, quizId },
      relations: ['quiz', 'user'],
    });

    if (!result) {
      throw new NotFoundException(`Result for user ${userId} and quiz ${quizId} not found`);
    }

    return ResultResponseDto.fromEntity(result);
  }

  async hasUserTakenQuiz(userId: number, quizId: number): Promise<boolean> {
    const count = await this.resultsRepository.count({
      where: { userId, quizId },
    });
    return count > 0;
  }

  async findByTeacherId(
    teacherId: number,
    filters?: {
      username?: string;
      quizTitle?: string;
      dateFrom?: string;
      dateTo?: string;
      includePractice?: boolean;
    },
  ): Promise<ResultResponseDto[]> {
    const query = this.resultsRepository
      .createQueryBuilder('result')
      .leftJoinAndSelect('result.user', 'user')
      .leftJoinAndSelect('result.quiz', 'quiz')
      .where('quiz.createdById = :teacherId', { teacherId });

    // По умолчанию исключаем практические тесты, если не указано иное
    if (!filters?.includePractice) {
      query.andWhere('result.isPractice = :isPractice', { isPractice: false });
    }

    if (filters) {
      if (filters.username) {
        query.andWhere('LOWER(user.username) LIKE :username', {
          username: `%${filters.username.toLowerCase()}%`,
        });
      }

      if (filters.quizTitle) {
        query.andWhere('LOWER(quiz.title) LIKE :quizTitle', {
          quizTitle: `%${filters.quizTitle.toLowerCase()}%`,
        });
      }

      if (filters.dateFrom) {
        query.andWhere('result.createdAt >= :dateFrom', {
          dateFrom: new Date(filters.dateFrom),
        });
      }

      if (filters.dateTo) {
        const dateTo = new Date(filters.dateTo);
        dateTo.setDate(dateTo.getDate() + 1);
        query.andWhere('result.createdAt < :dateTo', { dateTo });
      }
    }

    const results = await query.orderBy('result.createdAt', 'DESC').getMany();
    return results.map((result) => ResultResponseDto.fromEntity(result));
  }

  async getAnswersByResultId(resultId: number): Promise<Answer[]> {
    // Сначала получаем результат, чтобы узнать quizId и userId
    const result = await this.resultsRepository.findOne({
      where: { id: resultId },
    });

    if (!result) {
      throw new NotFoundException(`Result with ID ${resultId} not found`);
    }

    // Получаем ответы пользователя для данного теста
    const answers = await this.answersRepository.find({
      where: {
        userId: result.userId,
        question: {
          quizId: result.quizId,
        },
      },
      relations: ['question'],
    });

    return answers;
  }
}
