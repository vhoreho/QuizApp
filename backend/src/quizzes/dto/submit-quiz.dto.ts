import { IsNotEmpty, IsNumber, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateAnswerDto } from '../../answers/dto/create-answer.dto';

export class SubmitQuizDto {
  @IsNotEmpty()
  @IsNumber()
  quizId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAnswerDto)
  answers: CreateAnswerDto[];
} 