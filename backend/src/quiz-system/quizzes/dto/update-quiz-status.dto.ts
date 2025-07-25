import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateQuizStatusDto {
  @IsNotEmpty()
  @IsBoolean()
  isPublished: boolean;
}
