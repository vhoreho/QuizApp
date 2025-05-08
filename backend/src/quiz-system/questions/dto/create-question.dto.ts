import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsEnum,
  IsOptional,
  ValidateIf,
  IsObject,
} from 'class-validator';
import { QuestionType } from '../enums/question-type.enum';
import { Type } from 'class-transformer';

export class CreateQuestionDto {
  @IsNumber()
  @IsOptional() // quizId will be assigned by the service
  quizId?: number;

  @IsNotEmpty({ message: 'Question text is required' })
  @IsString({ message: 'Question text must be a string' })
  text: string;

  @IsEnum(QuestionType, { message: 'Question type must be a valid QuestionType enum value' })
  type: QuestionType;

  @IsNumber()
  @IsOptional()
  points: number = 1;

  @IsNumber()
  @IsOptional()
  order: number = 0;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  options: string[];

  @ValidateIf((o) => o.type === QuestionType.SINGLE_CHOICE || o.type === QuestionType.TRUE_FALSE)
  @IsString({
    message: 'correctAnswer must be a string for SINGLE_CHOICE and TRUE_FALSE questions',
  })
  @IsNotEmpty({ message: 'correctAnswer is required for SINGLE_CHOICE and TRUE_FALSE questions' })
  correctAnswer: string;

  @ValidateIf((o) => o.type === QuestionType.MULTIPLE_CHOICE)
  @IsArray({ message: 'correctAnswers must be an array for MULTIPLE_CHOICE questions' })
  @IsString({ each: true, message: 'Each item in correctAnswers must be a string' })
  @IsNotEmpty({
    message: 'correctAnswers array is required for MULTIPLE_CHOICE questions and cannot be empty',
  })
  correctAnswers: string[];

  @ValidateIf((o) => o.type === QuestionType.MATCHING)
  @IsObject({ message: 'matchingPairs must be an object for MATCHING questions' })
  @IsNotEmpty({ message: 'matchingPairs is required for MATCHING questions' })
  matchingPairs: { [key: string]: string };
}
