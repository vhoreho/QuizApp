import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './entities/question.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { Answer } from '../answers/entities/answer.entity';
import { CreateAnswerDto } from '../answers/dto/create-answer.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private questionsRepository: Repository<Question>,
    @InjectRepository(Answer)
    private answersRepository: Repository<Answer>,
  ) { }

  async create(quizId: number, createQuestionDto: CreateQuestionDto): Promise<Question> {
    const question = this.questionsRepository.create({
      ...createQuestionDto,
      quizId,
    });
    return this.questionsRepository.save(question);
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
      order: { id: 'ASC' },
    });
  }

  async update(id: number, updateQuestionDto: UpdateQuestionDto): Promise<Question> {
    const question = await this.findOne(id);

    const updatedQuestion = this.questionsRepository.merge(question, updateQuestionDto);
    return this.questionsRepository.save(updatedQuestion);
  }

  async remove(id: number): Promise<void> {
    const question = await this.findOne(id);
    await this.questionsRepository.remove(question);
  }

  async saveAnswer(createAnswerDto: CreateAnswerDto, userId: number): Promise<Answer> {
    const answer = this.answersRepository.create({
      ...createAnswerDto,
      userId,
    });
    return this.answersRepository.save(answer);
  }
} 