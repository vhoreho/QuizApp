import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quiz } from './entities/quiz.entity';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { UsersService } from '../users/users.service';
import { QuestionsService } from '../questions/questions.service';
import { Result } from '../results/entities/result.entity';
import { UpdateQuizStatusDto } from './dto/update-quiz-status.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';

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

    // Найти все вопросы, связанные с тестом
    const questions = await this.questionsService.findByQuizId(id);

    // Удалить все вопросы перед удалением теста
    for (const question of questions) {
      await this.questionsService.remove(question.id);
    }

    // После удаления всех вопросов можно удалить тест
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

    // Определяем, является ли тест практическим (для админов и преподавателей)
    const isPractice = user.role === 'administrator' || user.role === 'teacher';

    // Check if the user has already taken this quiz - для студентов
    // Администраторы и преподаватели могут проходить тест многократно в режиме практики
    if (!isPractice) {
      const existingResults = await this.resultsRepository.find({
        where: { userId, quizId }
      });

      if (existingResults.length > 0) {
        throw new ForbiddenException(
          'Вы уже проходили этот тест. Повторное прохождение запрещено.'
        );
      }
    }

    // Get all questions for this quiz
    const questions = await this.questionsService.findByQuizId(quizId);

    // Calculate score
    let correctAnswers = 0;
    let totalPartialPoints = 0;
    let totalPoints = 0;
    let maxPossiblePoints = 0;

    // Сохраняем ответы и считаем баллы
    for (const answerDto of submitQuizDto.answers) {
      const answer = await this.questionsService.saveAnswer(answerDto, userId);
      const question = questions.find(q => q.id === answerDto.questionId);
      const questionPoints = question.points || 1;

      // Учитываем частичные баллы
      if (answer.isCorrect) {
        correctAnswers++;
        totalPoints += questionPoints;
      } else if (answer.partialScore > 0) {
        // Добавляем частичные баллы пропорционально стоимости вопроса
        totalPartialPoints += answer.partialScore * questionPoints;
      }

      maxPossiblePoints += questionPoints;
    }

    const totalQuestions = questions.length;

    // Суммируем полные и частичные баллы
    const combinedPoints = totalPoints + totalPartialPoints;

    // Calculate score on a 10-point scale instead of percentage
    const score = Math.round((combinedPoints / maxPossiblePoints) * 10 * 100) / 100;

    // Save the result
    const result = this.resultsRepository.create({
      userId,
      quizId,
      score,
      correctAnswers,
      totalQuestions,
      totalPoints: combinedPoints,
      maxPossiblePoints,
      isPractice  // Добавляем флаг практики в результат
    });

    await this.resultsRepository.save(result);

    return {
      quizId,
      score,
      totalQuestions,
      correctAnswers,
      totalPoints: combinedPoints,
      maxPossiblePoints,
      partialPoints: totalPartialPoints,
      isPractice
    };
  }

  async updateStatus(id: number, updateQuizStatusDto: UpdateQuizStatusDto): Promise<Quiz> {
    const quiz = await this.findOne(id);

    quiz.isPublished = updateQuizStatusDto.isPublished;

    return this.quizzesRepository.save(quiz);
  }

  async update(id: number, updateQuizDto: UpdateQuizDto, userId: number): Promise<Quiz> {
    const quiz = await this.findOne(id);

    // Проверка, что пользователь имеет право обновлять этот тест
    if (quiz.createdById !== userId) {
      throw new ForbiddenException('You do not have permission to update this quiz');
    }

    // Обновляем только те поля, которые указаны в DTO
    Object.assign(quiz, updateQuizDto);

    return this.quizzesRepository.save(quiz);
  }
} 
