import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Quiz } from '../../quiz-system/quizzes/entities/quiz.entity';
import { Answer } from '../../quiz-system/answers/entities/answer.entity';
import { Result } from '../../quiz-system/results/entities/result.entity';

export enum UserRole {
  ADMIN = 'administrator',
  TEACHER = 'teacher',
  STUDENT = 'student',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string; // This will store the hashed password

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STUDENT,
  })
  role: UserRole;

  @OneToMany(() => Quiz, (quiz) => quiz.createdBy)
  quizzes: Quiz[];

  @OneToMany(() => Answer, (answer) => answer.user)
  answers: Answer[];

  @OneToMany(() => Result, (result) => result.user)
  results: Result[];
}
