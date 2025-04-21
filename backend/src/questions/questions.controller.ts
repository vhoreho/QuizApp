import { Controller, Get, Post, Body, Param, UseGuards, Request, Patch, Delete } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { Question } from './entities/question.entity';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) { }

  @Post(':quizId')
  create(
    @Param('quizId') quizId: string,
    @Body() createQuestionDto: CreateQuestionDto
  ): Promise<Question> {
    return this.questionsService.create(+quizId, createQuestionDto);
  }

  @Get()
  findAll(): Promise<Question[]> {
    return this.questionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Question> {
    return this.questionsService.findOne(+id);
  }

  @Get('quiz/:quizId')
  findByQuizId(@Param('quizId') quizId: string): Promise<Question[]> {
    return this.questionsService.findByQuizId(+quizId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateQuestionDto: UpdateQuestionDto
  ): Promise<Question> {
    return this.questionsService.update(+id, updateQuestionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.questionsService.remove(+id);
  }
} 