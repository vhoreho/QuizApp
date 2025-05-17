import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subject } from './entities/subject.entity';
import { CreateSubjectDto } from './dto/create-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject)
    private subjectsRepository: Repository<Subject>,
  ) { }

  async create(createSubjectDto: CreateSubjectDto): Promise<Subject> {
    try {
      const subject = this.subjectsRepository.create(createSubjectDto);
      return await this.subjectsRepository.save(subject);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Предмет с таким названием уже существует');
      }
      throw error;
    }
  }

  async findAll(): Promise<Subject[]> {
    return this.subjectsRepository.find();
  }

  async findOne(id: number): Promise<Subject> {
    const subject = await this.subjectsRepository.findOne({
      where: { id },
    });

    if (!subject) {
      throw new NotFoundException(`Предмет с ID ${id} не найден`);
    }

    return subject;
  }

  async count(): Promise<number> {
    return this.subjectsRepository.count();
  }

  async findWithQuizCount(): Promise<any[]> {
    return this.subjectsRepository
      .createQueryBuilder('subject')
      .leftJoin('subject.quizzes', 'quiz', 'quiz.isPublished = :isPublished', {
        isPublished: true,
      })
      .select('subject.id', 'id')
      .addSelect('subject.name', 'name')
      .addSelect('subject.icon', 'icon')
      .addSelect('COUNT(quiz.id)', 'quizCount')
      .groupBy('subject.id')
      .orderBy('subject.name', 'ASC')
      .getRawMany();
  }
} 