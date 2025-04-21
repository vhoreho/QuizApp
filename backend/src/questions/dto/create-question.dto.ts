import { IsArray, IsNotEmpty, IsNumber, IsString, IsEnum, IsOptional, ValidateIf, IsObject } from 'class-validator';
import { QuestionType } from '../enums/question-type.enum';

export class CreateQuestionDto {
  @IsNumber()
  quizId: number;

  @IsNotEmpty()
  @IsString()
  text: string;

  @IsEnum(QuestionType)
  type: QuestionType;

  @IsNumber()
  @IsOptional()
  points: number = 1;

  @IsNumber()
  @IsOptional()
  order: number = 0;

  @ValidateIf(o => false)
  @IsArray()
  @IsString({ each: true })
  options: string[];

  @ValidateIf(o => o.type === QuestionType.SINGLE_CHOICE || o.type === QuestionType.TRUE_FALSE)
  @IsString()
  correctAnswer: string;

  @ValidateIf(o => o.type === QuestionType.MULTIPLE_CHOICE)
  @IsArray()
  @IsString({ each: true })
  correctAnswers: string[];

  @ValidateIf(o => o.type === QuestionType.MATCHING)
  @IsObject()
  matchingPairs: { [key: string]: string };
} 