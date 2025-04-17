import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateQuestionDto {
  @IsNotEmpty()
  @IsNumber()
  quizId: number;

  @IsNotEmpty()
  @IsString()
  questionText: string;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  options: string[];

  @IsNotEmpty()
  @IsString()
  correctAnswer: string;
} 