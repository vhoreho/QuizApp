import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsObject,
  ValidateIf,
} from 'class-validator';
import { QuestionType } from '../../questions/enums/question-type.enum';

export class CreateAnswerDto {
  @IsNotEmpty()
  @IsNumber()
  questionId: number;

  @IsNotEmpty()
  @IsEnum(QuestionType)
  questionType: QuestionType;

  @ValidateIf(
    (o) =>
      o.questionType === QuestionType.SINGLE_CHOICE || o.questionType === QuestionType.TRUE_FALSE,
  )
  @IsString()
  selectedAnswer: string;

  @ValidateIf((o) => o.questionType === QuestionType.MULTIPLE_CHOICE)
  @IsArray()
  @IsString({ each: true })
  selectedAnswers: string[];

  @ValidateIf((o) => o.questionType === QuestionType.MATCHING)
  @IsObject()
  matchingPairs: { [key: string]: string };
}
