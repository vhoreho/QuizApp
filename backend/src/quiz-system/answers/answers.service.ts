import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Answer } from './entities/answer.entity';
import { CreateAnswerDto } from './dto/create-answer.dto';

@Injectable()
export class AnswersService {
  constructor(
    @InjectRepository(Answer)
    private answersRepository: Repository<Answer>,
  ) {}

  async create(createAnswerDto: CreateAnswerDto, userId: number): Promise<Answer> {
    const answer = this.answersRepository.create({
      ...createAnswerDto,
      userId,
    });
    return this.answersRepository.save(answer);
  }

  async findByUserId(userId: number): Promise<Answer[]> {
    return this.answersRepository.find({
      where: { userId },
      relations: ['question'],
    });
  }

  async findByQuestionId(questionId: number): Promise<Answer[]> {
    return this.answersRepository.find({
      where: { questionId },
      relations: ['user'],
    });
  }
}
