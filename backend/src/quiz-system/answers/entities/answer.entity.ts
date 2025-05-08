import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../../users/entities/user.entity';
import { Question } from '../../questions/entities/question.entity';

@Entity()
export class Answer {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Question, (question) => question.answers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @Column({ name: 'question_id' })
  questionId: number;

  @ManyToOne(() => User, (user) => user.answers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
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
