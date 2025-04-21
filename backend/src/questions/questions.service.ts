import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './entities/question.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { Answer } from '../answers/entities/answer.entity';
import { CreateAnswerDto } from '../answers/dto/create-answer.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QuestionType } from './enums/question-type.enum';

@Injectable()
export class QuestionsService {
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
        // Уже содержит correctAnswers
        break;
      case QuestionType.MATCHING:
        // Сохраняем ключи сопоставления в options, а значения в correctAnswers
        const keys = Object.keys(createQuestionDto.matchingPairs);
        const values = Object.values(createQuestionDto.matchingPairs);
        questionData.options = keys;
        questionData.correctAnswers = values;
        break;
    }

    const question = this.questionsRepository.create(questionData);
    const savedQuestion = await this.questionsRepository.save(question);

    // Так как save может вернуть массив, берем первый элемент,
    // но в данном случае мы сохраняем один объект, поэтому результат должен быть один
    return Array.isArray(savedQuestion) ? savedQuestion[0] : savedQuestion;
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
          createAnswerDto.selectedAnswers.every(a => question.correctAnswers.includes(a)) &&
          createAnswerDto.selectedAnswers.length === question.correctAnswers.length;

        // Считаем частичный балл
        if (!isCorrect && createAnswerDto.selectedAnswers.length > 0) {
          // Количество правильных выбранных ответов
          const correctSelectedCount = createAnswerDto.selectedAnswers.filter(
            a => question.correctAnswers.includes(a)
          ).length;

          // Количество неправильно выбранных ответов
          const incorrectSelectedCount = createAnswerDto.selectedAnswers.length - correctSelectedCount;

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