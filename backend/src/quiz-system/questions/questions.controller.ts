import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Patch,
  Delete,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { Question } from './entities/question.entity';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { CreateQuestionsBatchDto } from './dto/create-questions-batch.dto';

// Define the interface for batch responses
interface BatchResponse {
  success: boolean;
  totalQuestions: number;
  createdQuestions: Question[];
  failedQuestions: {
    index: number;
    error: string;
    questionData?: any;
  }[];
}

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post(':quizId')
  create(
    @Param('quizId') quizId: string,
    @Body() createQuestionDto: CreateQuestionDto,
  ): Promise<Question> {
    return this.questionsService.create(+quizId, createQuestionDto);
  }

  @Post('batch')
  async createBatch(
    @Body() createQuestionsBatchDto: CreateQuestionsBatchDto,
  ): Promise<BatchResponse> {
    try {
      const result = await this.questionsService.createBatch(createQuestionsBatchDto);

      return {
        success: true,
        totalQuestions: createQuestionsBatchDto.questions.length,
        createdQuestions: result.createdQuestions,
        failedQuestions: result.failedQuestions,
      };
    } catch (error) {
      // Если ошибка содержит информацию о созданных/неудачных вопросах,
      // возвращаем частичный успех
      if (error instanceof HttpException && error.getResponse()['cause']) {
        const cause = error.getResponse()['cause'];

        return {
          success: false,
          totalQuestions: createQuestionsBatchDto.questions.length,
          createdQuestions: cause.createdQuestions || [],
          failedQuestions: cause.failedQuestions || [],
        };
      }

      // Иначе пробрасываем ошибку дальше
      throw error;
    }
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
  update(@Param('id') id: string, @Body() updateQuestionDto: UpdateQuestionDto): Promise<Question> {
    return this.questionsService.update(+id, updateQuestionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.questionsService.remove(+id);
  }
}
