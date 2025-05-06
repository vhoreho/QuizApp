import { IsNotEmpty, IsString, IsArray, ValidateNested, ArrayMinSize, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuestionDto } from 'src/questions/dto/create-question.dto';

export class CreateQuizDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => CreateQuestionDto)
  questions: CreateQuestionDto[];
} 