import { Exclude, Expose } from "class-transformer";

@Exclude()
export class SubjectResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  quizCount?: number;
}
