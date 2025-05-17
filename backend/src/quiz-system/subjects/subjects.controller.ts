import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { SubjectResponseDto } from './dto/subject-response.dto';
import { plainToClass } from 'class-transformer';

@Controller('subjects')
@UseInterceptors(ClassSerializerInterceptor)
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async create(@Body() createSubjectDto: CreateSubjectDto) {
    const subject = await this.subjectsService.create(createSubjectDto);
    return plainToClass(SubjectResponseDto, subject);
  }

  @Get()
  async findAll() {
    const subjects = await this.subjectsService.findAll();
    return subjects.map(subject => plainToClass(SubjectResponseDto, subject));
  }

  @Get('with-quiz-count')
  async findWithQuizCount() {
    const subjects = await this.subjectsService.findWithQuizCount();
    return subjects.map(subject => {
      const dto = plainToClass(SubjectResponseDto, subject);
      dto.quizCount = parseInt(subject.quizCount, 10);
      return dto;
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const subject = await this.subjectsService.findOne(+id);
    return plainToClass(SubjectResponseDto, subject);
  }
} 