import { Type } from 'class-transformer';
import { IsArray, IsNumber, ValidateNested, IsNotEmpty } from 'class-validator';
import { CreateQuestionDto } from './create-question.dto';

export class CreateQuestionsBatchDto {
  @IsNumber({}, { message: 'quizId must be a number' })
  @IsNotEmpty({ message: 'quizId is required' })
  quizId: number;

  @IsArray({ message: 'questions must be an array' })
  @IsNotEmpty({ message: 'questions array cannot be empty' })
  @ValidateNested({ each: true, message: 'Each question must be a valid CreateQuestionDto' })
  @Type(() => CreateQuestionDto)
  questions: CreateQuestionDto[];
} 