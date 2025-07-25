import { Controller, Get, Post, Body, Param, Request } from '@nestjs/common';
import { AnswersService } from './answers.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { Answer } from './entities/answer.entity';

@Controller('answers')
export class AnswersController {
  constructor(private readonly answersService: AnswersService) { }

  @Post()
  create(@Body() createAnswerDto: CreateAnswerDto, @Request() req): Promise<Answer> {
    const userId = req.user?.id || 1; // For testing, we'll use userId 1 if no auth
    return this.answersService.create(createAnswerDto, userId);
  }

  @Get('user/:userId')
  findByUserId(@Param('userId') userId: string): Promise<Answer[]> {
    return this.answersService.findByUserId(+userId);
  }

  @Get('question/:questionId')
  findByQuestionId(@Param('questionId') questionId: string): Promise<Answer[]> {
    return this.answersService.findByQuestionId(+questionId);
  }
}
