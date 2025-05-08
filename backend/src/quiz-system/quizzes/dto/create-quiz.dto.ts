import {
  IsNotEmpty,
  IsString,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuestionDto } from '../../questions/dto/create-question.dto';

export class CreateQuizDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  categoryId: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  timeLimit?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  passingScore?: number;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => CreateQuestionDto)
  questions: CreateQuestionDto[];
}
