import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Quiz } from '../../quiz-system/quizzes/entities/quiz.entity';

@Entity()
export class Result {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.results, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ name: 'userId' })
  userId: number;

  @ManyToOne(() => Quiz, (quiz) => quiz.results, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quizId' })
  quiz: Quiz;

  @Column({ name: 'quizId' })
  quizId: number;

  @Column('float')
  score: number;

  @Column({ default: 0 })
  correctAnswers: number;

  @Column({ default: 0 })
  totalQuestions: number;

  @Column({ type: 'float', default: 0 })
  totalPoints: number;

  @Column({ type: 'float', default: 0 })
  maxPossiblePoints: number;

  @Column({ default: false })
  isPractice: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
