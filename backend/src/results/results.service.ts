import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Result } from './entities/result.entity';

@Injectable()
export class ResultsService {
  constructor(
    @InjectRepository(Result)
    private resultsRepository: Repository<Result>,
  ) { }

  async findAll(): Promise<Result[]> {
    return this.resultsRepository.find({
      relations: ['user', 'quiz'],
    });
  }

  async findOne(id: number): Promise<Result> {
    const result = await this.resultsRepository.findOne({
      where: { id },
      relations: ['user', 'quiz'],
    });

    if (!result) {
      throw new NotFoundException(`Result with ID ${id} not found`);
    }

    return result;
  }

  async findByUserId(userId: number): Promise<Result[]> {
    return this.resultsRepository.find({
      where: { userId },
      relations: ['quiz'],
      order: { id: 'DESC' },
    });
  }

  async findByQuizId(quizId: number): Promise<Result[]> {
    return this.resultsRepository.find({
      where: { quizId },
      relations: ['user'],
      order: { score: 'DESC' },
    });
  }

  async count(): Promise<number> {
    return this.resultsRepository.count();
  }

  async getAverageScoreByQuiz(quizId: number): Promise<number> {
    const results = await this.findByQuizId(quizId);
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
    const scores = results.map(result => result.score);
    const averageScore = scores.reduce((a, b) => a + b, 0) / totalQuizzes;
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    const quizzesPassed = scores.filter(score => score >= 60).length;

    return {
      totalQuizzes,
      averageScore,
      highestScore,
      lowestScore,
      quizzesPassed,
      recentResults: results.slice(0, 5),
    };
  }

  async findByUserAndQuiz(userId: number, quizId: number): Promise<Result> {
    const result = await this.resultsRepository.findOne({
      where: { userId, quizId },
      relations: ['quiz', 'user'],
    });

    if (!result) {
      throw new NotFoundException(`Result for user ${userId} and quiz ${quizId} not found`);
    }

    return result;
  }
} 
