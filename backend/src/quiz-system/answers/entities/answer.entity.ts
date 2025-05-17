import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../../users/entities/user.entity';
import { Question } from '../../questions/entities/question.entity';

@Entity()
export class Answer {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Question, (question) => question.answers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'questionId' })
  question: Question;

  @Column({ name: 'questionId' })
  questionId: number;

  @ManyToOne(() => User, (user) => user.answers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ name: 'userId' })
  userId: number;

  @Column({ nullable: true })
  selectedAnswer: string;

  @Column('simple-array', { nullable: true })
  selectedAnswers: string[];

  @Column({ type: 'json', nullable: true })
  matchingPairs: { [key: string]: string };

  @Column({ default: false })
  isCorrect: boolean;

  @Column({ type: 'float', default: 0 })
  partialScore: number;
}
