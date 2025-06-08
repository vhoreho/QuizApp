import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quiz } from './entities/quiz.entity';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { UsersService } from '../../users/users.service';
import { QuestionsService } from '../questions/questions.service';
import { Result } from '../results/entities/result.entity';
import { UpdateQuizStatusDto } from './dto/update-quiz-status.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { SubjectsService } from '../subjects/subjects.service';
import { HomepageResponseDto } from './dto/homepage-response.dto';
import { QuizResponseDto } from './dto/quiz-response.dto';
import { ResultResponseDto } from '../results/dto/result-response.dto';
import { UserRole } from '../../users/entities/user.entity';

@Injectable()
export class QuizzesService {
  private readonly logger = new Logger(QuizzesService.name);

  constructor(
    @InjectRepository(Quiz)
    private quizzesRepository: Repository<Quiz>,
    @InjectRepository(Result)
    private resultsRepository: Repository<Result>,
    private usersService: UsersService,
    private questionsService: QuestionsService,
    private subjectsService: SubjectsService,
  ) { }

  async create(createQuizDto: CreateQuizDto, userId: number): Promise<Quiz> {
    this.logger.debug(`Creating quiz with data: ${JSON.stringify(createQuizDto)}`);

    try {
      // Проверяем существование пользователя
      await this.usersService.findOne(userId);

      // Проверяем существование предмета
      try {
        await this.subjectsService.findOne(createQuizDto.subjectId);
      } catch (error) {
        this.logger.error(`Error checking subject: ${error.message}`, error.stack);
        throw new BadRequestException(`Предмет с ID ${createQuizDto.subjectId} не найден`);
      }

      // Extract questions from the DTO
      const { questions, ...quizData } = createQuizDto;

      // Validate that there is at least one question
      if (!questions || questions.length < 1) {
        const errorMsg = 'Quiz must contain at least one question';
        throw new BadRequestException(errorMsg);
      }

      // Create and save the quiz
      const quiz = this.quizzesRepository.create({
        ...quizData,
        subjectId: quizData.subjectId,
        createdById: userId,
      });

      try {
        const savedQuiz = await this.quizzesRepository.save(quiz);

        // Ensure each question has the quizId set
        await this.questionsService.createBatch({
          quizId: savedQuiz.id,
          questions: questions.map((q) => ({
            ...q,
            quizId: savedQuiz.id,
          })),
        });

        console.log('✅ ~ QuizzesService ~ questions batch created successfully');

        // Return the saved quiz with its relations
        const fullQuiz = await this.findOne(savedQuiz.id);
        console.log('✅ ~ QuizzesService ~ returning complete quiz:', fullQuiz.id, fullQuiz.title);
        return fullQuiz;
      } catch (error) {
        console.error('❌ ~ QuizzesService ~ error during quiz creation:', error.message);
        console.error('Stack trace:', error.stack);

        if (error.response) {
          console.error('Response details:', error.response);
        }

        throw error;
      }
    } catch (error) {
      console.error('❌ ~ QuizzesService ~ create error:', error.message);
      console.error('Stack trace:', error.stack);
      throw error;
    }
  }

  async findAll(): Promise<Quiz[]> {
    const quizzes = await this.quizzesRepository.find({
      relations: ['createdBy'],
      where: {
        isPublished: true,
      },
    });

    return quizzes;
  }

  async findAllWithDetails(
    withDetails: boolean = false,
    createdById?: number,
    published?: boolean,
    isAdminRequest: boolean = false,
  ): Promise<Quiz[]> {
    const relations = ['createdBy'];

    if (withDetails) {
      relations.push('questions');
    }

    // Формируем условия запроса
    const whereConditions: any = {};

    // Фильтр по создателю
    if (createdById) {
      whereConditions.createdById = createdById;
    }


    return this.quizzesRepository.find({
      where: whereConditions,
      relations,
      select: {
        createdBy: {
          id: true,
          username: true,
          name: true,
          role: true,
        },
      },
      order: {
        id: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<Quiz> {
    const quiz = await this.quizzesRepository.findOne({
      where: { id },
      relations: ['createdBy', 'questions'],
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

  async count(publishedOnly: boolean = false): Promise<number> {
    if (publishedOnly) {
      return this.quizzesRepository.count({
        where: { isPublished: true },
      });
    }
    return this.quizzesRepository.count();
  }

  async findRecent(limit: number, publishedOnly: boolean = false): Promise<Quiz[]> {
    const query: any = {
      relations: ['createdBy'],
      order: { id: 'DESC' },
      take: limit,
    };

    if (publishedOnly) {
      query.where = { isPublished: true };
    }

    return this.quizzesRepository.find(query);
  }

  async findByTeacherId(teacherId: number): Promise<Quiz[]> {
    return this.quizzesRepository.find({
      where: { createdById: teacherId },
      relations: ['questions'],
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
        where: { userId, quizId },
      });

      if (existingResults.length > 0) {
        throw new ForbiddenException(
          'Вы уже проходили этот тест. Повторное прохождение запрещено.',
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
      const question = questions.find((q) => q.id === answerDto.questionId);
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
      isPractice, // Добавляем флаг практики в результат
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
      isPractice,
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

  async getRecentQuizzes(limit: number, publishedOnly: boolean = false): Promise<Quiz[]> {
    return this.findRecent(limit, publishedOnly);
  }

  async getHomepageData(userId: number, userRole: UserRole): Promise<HomepageResponseDto> {
    const [quizzes, subjects] = await Promise.all([
      this.getQuizzesForRole(userId, userRole),
      this.subjectsService.findAll()
    ]);

    const stats = await this.getStatsForRole(userId, userRole);

    return new HomepageResponseDto({
      userRole,
      quizzes,
      subjects,
      stats
    });
  }

  private async getQuizzesForRole(userId: number, userRole: UserRole): Promise<QuizResponseDto[]> {
    let quizzes: Quiz[];

    switch (userRole) {
      case UserRole.ADMIN:
        quizzes = await this.findAllWithDetails(true, null, null, true);
        break;
      case UserRole.TEACHER:
        quizzes = await this.findAllWithDetails(true, userId, null, false);
        break;
      default: // STUDENT
        quizzes = await this.findAllWithDetails(true, null, true, false);
    }

    return quizzes.map(quiz => QuizResponseDto.fromEntity(quiz));
  }

  private async getStatsForRole(userId: number, userRole: UserRole) {
    const stats: any = {};

    switch (userRole) {
      case UserRole.ADMIN:
        const [totalQuizzes, totalUsers, totalSubjects] = await Promise.all([
          this.quizzesRepository.count(),
          this.usersService.count(),
          this.subjectsService.count()
        ]);
        stats.totalQuizzes = totalQuizzes;
        stats.totalUsers = totalUsers;
        stats.totalSubjects = totalSubjects;
        break;

      case UserRole.TEACHER:
        const [teacherQuizzes, teacherResults] = await Promise.all([
          this.quizzesRepository.count({ where: { createdById: userId } }),
          this.resultsRepository.find({
            where: { quiz: { createdById: userId } },
            relations: ['quiz', 'user'],
            order: { createdAt: 'DESC' },
            take: 5
          })
        ]);
        stats.totalQuizzes = teacherQuizzes;
        stats.recentResults = teacherResults.map(result => ResultResponseDto.fromEntity(result));
        break;

      default: // STUDENT
        const [studentResults, averageScore] = await Promise.all([
          this.resultsRepository.find({
            where: { userId },
            relations: ['quiz'],
            order: { createdAt: 'DESC' },
            take: 5
          }),
          this.resultsRepository
            .createQueryBuilder('result')
            .where('result.userId = :userId', { userId })
            .select('AVG(result.score)', 'average')
            .getRawOne()
        ]);
        stats.recentResults = studentResults.map(result => ResultResponseDto.fromEntity(result));
        stats.averageScore = parseFloat(averageScore?.average || '0');
    }

    return stats;
  }
}
