import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quiz } from './entities/quiz.entity';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { UsersService } from '../users/users.service';
import { QuestionsService } from '../questions/questions.service';
import { Result } from '../results/entities/result.entity';

@Injectable()
export class QuizzesService {
  constructor(
    @InjectRepository(Quiz)
    private quizzesRepository: Repository<Quiz>,
    @InjectRepository(Result)
    private resultsRepository: Repository<Result>,
    private usersService: UsersService,
    private questionsService: QuestionsService,
  ) { }

  async create(createQuizDto: CreateQuizDto, userId: number): Promise<Quiz> {
    const user = await this.usersService.findOne(userId);

    const quiz = this.quizzesRepository.create({
      ...createQuizDto,
      createdById: userId,
    });

    return this.quizzesRepository.save(quiz);
  }

  async findAll(): Promise<Quiz[]> {
    return this.quizzesRepository.find({
      relations: ['createdBy']
    });
  }

  async findAllWithDetails(withDetails: boolean = false): Promise<Quiz[]> {
    const relations = ['createdBy'];
    if (withDetails) {
      relations.push('questions');
    }
    return this.quizzesRepository.find({
      relations
    });
  }

  async findOne(id: number): Promise<Quiz> {
    const quiz = await this.quizzesRepository.findOne({
      where: { id },
      relations: ['createdBy', 'questions']
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }

    return quiz;
  }

  async remove(id: number): Promise<void> {
    const quiz = await this.findOne(id);
    await this.quizzesRepository.remove(quiz);
  }

  async count(): Promise<number> {
    return this.quizzesRepository.count();
  }

  async findRecent(limit: number): Promise<Quiz[]> {
    return this.quizzesRepository.find({
      relations: ['createdBy'],
      order: { id: 'DESC' },
      take: limit,
    });
  }

  async findByTeacherId(teacherId: number): Promise<Quiz[]> {
    return this.quizzesRepository.find({
      where: { createdById: teacherId },
      relations: ['questions']
    });
  }

  async submitQuiz(quizId: number, submitQuizDto: SubmitQuizDto, userId: number) {
    const quiz = await this.findOne(quizId);
    const user = await this.usersService.findOne(userId);

    // Get all questions for this quiz
    const questions = await this.questionsService.findByQuizId(quizId);

    // Calculate score
    let correctAnswers = 0;

    for (const answer of submitQuizDto.answers) {
      const question = questions.find(q => q.id === answer.questionId);

      if (question && question.correctAnswer === answer.selectedAnswer) {
        correctAnswers++;
      }
    }

    const totalQuestions = questions.length;
    const score = (correctAnswers / totalQuestions) * 100;

    // Save the answers
    for (const answerDto of submitQuizDto.answers) {
      await this.questionsService.saveAnswer(answerDto, userId);
    }

    // Save the result
    const result = this.resultsRepository.create({
      userId,
      quizId,
      score,
    });

    await this.resultsRepository.save(result);

    return {
      quizId,
      score,
      totalQuestions,
      correctAnswers,
    };
  }
} 
