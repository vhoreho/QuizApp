import { IsString, IsNumber, IsOptional, IsArray } from 'class-validator';

export class UpdateQuestionDto {
  @IsString()
  @IsOptional()
  text?: string;

  @IsArray()
  @IsOptional()
  options?: string[];

  @IsString()
  @IsOptional()
  correctAnswer?: string;

  @IsNumber()
  @IsOptional()
  points?: number;
}
