import { Controller, Get, Param } from '@nestjs/common';
import { ResultsService } from './results.service';
import { Result } from './entities/result.entity';
import { ResultResponseDto } from './dto/result-response.dto';

@Controller('results')
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @Get('user/:userId')
  findByUserId(@Param('userId') userId: string): Promise<ResultResponseDto[]> {
    return this.resultsService.findByUserId(+userId);
  }

  @Get('quiz/:quizId')
  findByQuizId(@Param('quizId') quizId: string): Promise<ResultResponseDto[]> {
    return this.resultsService.findByQuizId(+quizId);
  }

  @Get('user/:userId/quiz/:quizId')
  findByUserAndQuiz(
    @Param('userId') userId: string,
    @Param('quizId') quizId: string,
  ): Promise<ResultResponseDto> {
    return this.resultsService.findByUserAndQuiz(+userId, +quizId);
  }
}
