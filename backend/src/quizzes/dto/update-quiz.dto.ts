import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class UpdateQuizDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  timeLimit?: number;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
} 