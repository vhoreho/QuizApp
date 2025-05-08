import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CategoryResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  icon: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
} 