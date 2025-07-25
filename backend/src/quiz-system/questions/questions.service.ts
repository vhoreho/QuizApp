import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Question } from './entities/question.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { Answer } from '../answers/entities/answer.entity';
import { CreateAnswerDto } from '../answers/dto/create-answer.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QuestionType } from './enums/question-type.enum';
import { CreateQuestionsBatchDto } from './dto/create-questions-batch.dto';

interface BatchResult {
  createdQuestions: Question[];
  failedQuestions: {
    index: number;
    error: string;
    questionData?: any;
  }[];
}

@Injectable()
export class QuestionsService {
  private readonly logger = new Logger(QuestionsService.name);

  constructor(
    @InjectRepository(Question)
    private questionsRepository: Repository<Question>,
    @InjectRepository(Answer)
    private answersRepository: Repository<Answer>,
  ) { }

  async create(quizId: number, createQuestionDto: CreateQuestionDto): Promise<Question> {
    const questionData: any = {
      ...createQuestionDto,
      quizId,
    };

    // Преобразование данных в зависимости от типа вопроса
    switch (createQuestionDto.type) {
      case QuestionType.SINGLE_CHOICE:
      case QuestionType.TRUE_FALSE:
        questionData.correctAnswers = [createQuestionDto.correctAnswer];
        break;
      case QuestionType.MULTIPLE_CHOICE:
        // Ensure correctAnswers is properly handled as an array without splitting strings
        if (Array.isArray(createQuestionDto.correctAnswers)) {
          questionData.correctAnswers = [...createQuestionDto.correctAnswers];
        }
        break;
      case QuestionType.MATCHING:
        // Сохраняем ключи сопоставления в options, а значения в correctAnswers
        const keys = Object.keys(createQuestionDto.matchingPairs);
        const values = Object.values(createQuestionDto.matchingPairs);
        questionData.options = keys;
        questionData.correctAnswers = values;
        break;
    }

    // Ensure options is treated as a proper array
    if (createQuestionDto.options && Array.isArray(createQuestionDto.options)) {
      questionData.options = [...createQuestionDto.options];
    }

    this.logger.log(
      `Creating question with data: ${JSON.stringify({
        type: questionData.type,
        text: questionData.text?.substring(0, 30) + '...',
        options: Array.isArray(questionData.options) ? questionData.options.length : 'none',
        correctAnswers: Array.isArray(questionData.correctAnswers)
          ? questionData.correctAnswers.length
          : 'none',
      })}`,
    );

    const question = this.questionsRepository.create(questionData);
    const savedQuestion = await this.questionsRepository.save(question);

    // Так как save может вернуть массив, берем первый элемент,
    // но в данном случае мы сохраняем один объект, поэтому результат должен быть один
    return Array.isArray(savedQuestion) ? savedQuestion[0] : savedQuestion;
  }

  /**
   * Создает несколько вопросов одновременно
   * @param batchDto Объект с quizId и массивом вопросов
   * @returns Объект с созданными вопросами и информацией о неудачных
   */
  async createBatch(batchDto: CreateQuestionsBatchDto): Promise<BatchResult> {
    this.logger.log(
      `Starting batch creation with ${batchDto.questions?.length || 0} questions for quiz ID ${batchDto.quizId}`,
    );

    const { quizId, questions } = batchDto;
    const result: BatchResult = {
      createdQuestions: [],
      failedQuestions: [],
    };

    if (!questions || !questions.length) {
      this.logger.error('No questions provided for batch creation');
      throw new BadRequestException('No questions provided for batch creation');
    }

    // Преобразуем и валидируем каждый вопрос по отдельности
    const questionEntities: DeepPartial<Question>[] = [];

    for (let i = 0; i < questions.length; i++) {
      const questionDto = questions[i];
      try {
        // Validate required fields
        if (!questionDto.text) {
          throw new Error('Question text is required');
        }
        if (!questionDto.type) {
          throw new Error('Question type is required');
        }

        const questionData: DeepPartial<Question> = {
          ...questionDto,
          quizId,
          // Если порядок не указан, используем индекс
          order: questionDto.order !== undefined ? questionDto.order : i,
        };

        // Ensure options is properly handled as an array
        if (questionDto.options && Array.isArray(questionDto.options)) {
          // Create a new array to avoid reference issues
          questionData.options = [...questionDto.options];

          // Log the options for debugging
          this.logger.log(`Question ${i + 1} options: ${JSON.stringify(questionData.options)}`);
        }

        // Преобразование данных в зависимости от типа вопроса
        switch (questionDto.type) {
          case QuestionType.SINGLE_CHOICE:
          case QuestionType.TRUE_FALSE:
            if (!questionDto.correctAnswer) {
              throw new Error(
                `Question ${i + 1}: correctAnswer is required for ${questionDto.type} questions`,
              );
            }
            questionData.correctAnswers = [questionDto.correctAnswer];
            break;
          case QuestionType.MULTIPLE_CHOICE:
            if (
              !questionDto.correctAnswers ||
              !Array.isArray(questionDto.correctAnswers) ||
              questionDto.correctAnswers.length === 0
            ) {
              throw new Error(
                `Question ${i + 1}: correctAnswers array is required for MULTIPLE_CHOICE questions`,
              );
            }

            // Ensure we create a new array to avoid reference issues
            questionData.correctAnswers = [...questionDto.correctAnswers];

            // Log the correctAnswers for debugging
            this.logger.log(
              `Question ${i + 1} correctAnswers: ${JSON.stringify(questionData.correctAnswers)}`,
            );
            break;
          case QuestionType.MATCHING:
            // Сохраняем ключи сопоставления в options, а значения в correctAnswers
            if (!questionDto.matchingPairs || typeof questionDto.matchingPairs !== 'object') {
              throw new Error(
                `Question ${i + 1}: matchingPairs object is required for MATCHING questions`,
              );
            }

            if (Object.keys(questionDto.matchingPairs).length === 0) {
              throw new Error(
                `Question ${i + 1}: matchingPairs cannot be empty for MATCHING questions`,
              );
            }

            const keys = Object.keys(questionDto.matchingPairs);
            const values = Object.values(questionDto.matchingPairs);
            questionData.options = keys;
            questionData.correctAnswers = values;
            break;
          default:
            throw new Error(`Question ${i + 1}: Unknown question type: ${questionDto.type}`);
        }

        questionEntities.push(questionData);
      } catch (error) {
        // Логируем ошибку и продолжаем с другими вопросами
        this.logger.error(`Error processing question at index ${i}: ${error.message}`, error.stack);
        result.failedQuestions.push({
          index: i,
          error: error.message || 'Unknown error',
          questionData: questionDto,
        });
      }
    }

    if (questionEntities.length === 0) {
      const validationErrors = result.failedQuestions
        .map((f) => `[Q${f.index}] ${f.error}`)
        .join('; ');
      this.logger.error(`All questions failed validation: ${validationErrors}`);
      throw new BadRequestException(`All questions failed validation: ${validationErrors}`);
    }

    try {
      // Log each question entity before saving
      questionEntities.forEach((q, idx) => {
        this.logger.log(
          `Question entity ${idx + 1} before save: options=${JSON.stringify(q.options)}, correctAnswers=${JSON.stringify(q.correctAnswers)}`,
        );
      });

      // Создаем сущности и сохраняем все вопросы за одну транзакцию
      const entities = this.questionsRepository.create(questionEntities);
      result.createdQuestions = await this.questionsRepository.save(entities);

      // Log each created question
      result.createdQuestions.forEach((q, idx) => {
        this.logger.log(
          `Created question ${idx + 1}: id=${q.id}, options=${JSON.stringify(q.options)}, correctAnswers=${JSON.stringify(q.correctAnswers)}`,
        );
      });

      this.logger.log(
        `Successfully created ${result.createdQuestions.length} questions for quiz ID ${quizId}`,
      );

      if (result.failedQuestions.length > 0) {
        this.logger.warn(
          `Failed to create ${result.failedQuestions.length} questions for quiz ID ${quizId}`,
        );
      }

      return result;
    } catch (error) {
      this.logger.error(`Error saving batch questions: ${error.message}`, error.stack);
      // Если ошибка происходит при сохранении, все вопросы считаются неудачными
      result.failedQuestions = [
        ...result.failedQuestions,
        ...questionEntities.map((q, idx) => ({
          index: idx,
          error: error.message || 'Database error',
          questionData: q,
        })),
      ];
      result.createdQuestions = [];

      throw new BadRequestException(`Failed to save questions: ${error.message}`, {
        cause: result,
      });
    }
  }

  async findAll(): Promise<Question[]> {
    return this.questionsRepository.find();
  }

  async findOne(id: number): Promise<Question> {
    const question = await this.questionsRepository.findOne({ where: { id } });
    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }
    return question;
  }

  async findByQuizId(quizId: number): Promise<Question[]> {
    return this.questionsRepository.find({
      where: { quizId },
      order: { order: 'ASC' },
    });
  }

  async update(id: number, updateQuestionDto: UpdateQuestionDto): Promise<Question> {
    const question = await this.findOne(id);

    const updatedQuestion = this.questionsRepository.merge(question, updateQuestionDto);
    return this.questionsRepository.save(updatedQuestion);
  }

  async remove(id: number): Promise<void> {
    const question = await this.findOne(id);

    // Найти и удалить все ответы, связанные с вопросом
    const answers = await this.answersRepository.find({ where: { questionId: id } });
    if (answers.length > 0) {
      await this.answersRepository.remove(answers);
    }

    // После удаления ответов можно удалить вопрос
    await this.questionsRepository.remove(question);
  }

  async saveAnswer(createAnswerDto: CreateAnswerDto, userId: number): Promise<Answer> {
    const question = await this.findOne(createAnswerDto.questionId);
    const answerData: any = {
      questionId: createAnswerDto.questionId,
      userId,
    };

    let isCorrect = false;
    let partialScore = 0;

    // Проверка правильности ответа в зависимости от типа вопроса
    switch (createAnswerDto.questionType) {
      case QuestionType.SINGLE_CHOICE:
      case QuestionType.TRUE_FALSE:
        answerData.selectedAnswer = createAnswerDto.selectedAnswer;
        isCorrect = question.correctAnswers.includes(createAnswerDto.selectedAnswer);
        partialScore = isCorrect ? 1 : 0;
        break;
      case QuestionType.MULTIPLE_CHOICE:
        answerData.selectedAnswers = createAnswerDto.selectedAnswers;

        // Проверяем полную правильность
        isCorrect =
          createAnswerDto.selectedAnswers.every((a) => question.correctAnswers.includes(a)) &&
          createAnswerDto.selectedAnswers.length === question.correctAnswers.length;

        // Считаем частичный балл
        if (!isCorrect && createAnswerDto.selectedAnswers.length > 0) {
          // Количество правильных выбранных ответов
          const correctSelectedCount = createAnswerDto.selectedAnswers.filter((a) =>
            question.correctAnswers.includes(a),
          ).length;

          // Количество неправильно выбранных ответов
          const incorrectSelectedCount =
            createAnswerDto.selectedAnswers.length - correctSelectedCount;

          // Базовая формула: правильно выбрано / всего правильных ответов
          partialScore = correctSelectedCount / question.correctAnswers.length;

          // Штраф за выбор неправильных ответов
          const penalty = incorrectSelectedCount * 0.1;
          partialScore = Math.max(0, partialScore - penalty);
        } else if (isCorrect) {
          partialScore = 1;
        }
        break;
      case QuestionType.MATCHING:
        answerData.matchingPairs = createAnswerDto.matchingPairs;

        // Получаем пары ключ-значение
        const userPairs = Object.entries(createAnswerDto.matchingPairs);
        const totalPairs = question.options.length;
        let correctPairsCount = 0;

        // Проверяем каждую пару и считаем правильные сопоставления
        userPairs.forEach(([key, value], index) => {
          const keyIdx = question.options.indexOf(key);
          if (keyIdx !== -1 && question.correctAnswers[keyIdx] === value) {
            correctPairsCount++;
          }
        });

        // Полная правильность
        isCorrect = correctPairsCount === totalPairs;

        // Частичный балл
        partialScore = totalPairs > 0 ? correctPairsCount / totalPairs : 0;
        break;
    }

    answerData.isCorrect = isCorrect;
    answerData.partialScore = partialScore;
    const answer = this.answersRepository.create(answerData);
    const savedAnswer = await this.answersRepository.save(answer);

    // Так как save может вернуть массив, берем первый элемент,
    // но в данном случае мы сохраняем один объект, поэтому результат должен быть один
    return Array.isArray(savedAnswer) ? savedAnswer[0] : savedAnswer;
  }
}
