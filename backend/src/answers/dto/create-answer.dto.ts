import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateAnswerDto {
  @IsNotEmpty()
  @IsNumber()
  questionId: number;

  @IsNotEmpty()
  @IsString()
  selectedAnswer: string;
} 