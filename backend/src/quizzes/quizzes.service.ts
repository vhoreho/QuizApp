import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
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
    try {

      const user = await this.usersService.findOne(userId);

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
        createdById: userId,
      });


      try {
        const savedQuiz = await this.quizzesRepository.save(quiz);;


        // Ensure each question has the quizId set
        await this.questionsService.createBatch({
          quizId: savedQuiz.id,
          questions: questions.map(q => ({
            ...q,
            quizId: savedQuiz.id
          }))
        });

        console.log("✅ ~ QuizzesService ~ questions batch created successfully");

        // Return the saved quiz with its relations
        const fullQuiz = await this.findOne(savedQuiz.id);
        console.log("✅ ~ QuizzesService ~ returning complete quiz:", fullQuiz.id, fullQuiz.title);
        return fullQuiz;
      } catch (error) {
        console.error("❌ ~ QuizzesService ~ error during quiz creation:", error.message);
        console.error("Stack trace:", error.stack);

        if (error.response) {
          console.error("Response details:", error.response);
        }

        throw error;
      }
    } catch (error) {
      console.error("❌ ~ QuizzesService ~ create error:", error.message);
      console.error("Stack trace:", error.stack);
      throw error;
    }
  }

  async findAll(): Promise<Quiz[]> {
    return this.quizzesRepository.find({
      relations: ['createdBy']
    });
  }

  async findAllWithDetails(
    withDetails: boolean = false,
    createdById?: number,
    published?: boolean,
    isAdminRequest: boolean = false
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

    // Фильтр по статусу публикации
    if (published !== null && published !== undefined) {
      whereConditions.isPublished = published;
    } else if (!isAdminRequest) {
      // Если это не админский запрос и не указан явный фильтр по публикации, 
      // то возвращаем только опубликованные тесты
      whereConditions.isPublished = true;
    }

    return this.quizzesRepository.find({
      where: whereConditions,
      relations,
      select: {
        createdBy: {
          id: true,
          username: true,
          name: true,
          role: true
        }
      },
      order: {
        id: 'DESC'
      }
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

  async count(publishedOnly: boolean = false): Promise<number> {
    if (publishedOnly) {
      return this.quizzesRepository.count({
        where: { isPublished: true }
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

  async getRecentQuizzes(limit: number, publishedOnly: boolean = false): Promise<Quiz[]> {
    return this.findRecent(limit, publishedOnly);
  }
} 
