import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Subject } from "./entities/subject.entity";
import { CreateSubjectDto } from "./dto/create-subject.dto";
import { UpdateSubjectDto } from "./dto/update-subject.dto";

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject)
    private subjectsRepository: Repository<Subject>
  ) {}

  async create(createSubjectDto: CreateSubjectDto): Promise<Subject> {
    try {
      console.log("Creating subject with data:", createSubjectDto);
      const subject = this.subjectsRepository.create(createSubjectDto);
      console.log("Created subject entity:", subject);
      const savedSubject = await this.subjectsRepository.save(subject);
      console.log("Saved subject:", savedSubject);
      return savedSubject;
    } catch (error) {
      console.error("Error creating subject:", error);
      if (error.code === "23505") {
        throw new ConflictException("Предмет с таким названием уже существует");
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
      .createQueryBuilder("subject")
      .leftJoin("subject.quizzes", "quiz", "quiz.isPublished = :isPublished", {
        isPublished: true,
      })
      .select("subject.id", "id")
      .addSelect("subject.name", "name")
      .addSelect("COUNT(quiz.id)", "quizCount")
      .groupBy("subject.id")
      .orderBy("subject.name", "ASC")
      .getRawMany();
  }

  async update(
    id: number,
    updateSubjectDto: UpdateSubjectDto
  ): Promise<Subject> {
    const subject = await this.findOne(id);

    try {
      Object.assign(subject, updateSubjectDto);
      return await this.subjectsRepository.save(subject);
    } catch (error) {
      if (error.code === "23505") {
        throw new ConflictException("Предмет с таким названием уже существует");
      }
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    const subject = await this.findOne(id);
    await this.subjectsRepository.remove(subject);
  }
}
