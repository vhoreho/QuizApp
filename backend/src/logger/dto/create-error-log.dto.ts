import { IsString, IsOptional, IsNumber, IsObject } from 'class-validator';

export class CreateErrorLogDto {
  @IsString()
  errorMessage: string;

  @IsOptional()
  @IsString()
  stackTrace?: string;

  @IsString()
  source: string;

  @IsOptional()
  @IsNumber()
  userId?: number;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsString()
  url?: string;
} 