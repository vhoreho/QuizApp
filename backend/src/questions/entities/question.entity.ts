import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Quiz } from '../../quizzes/entities/quiz.entity';
import { Answer } from '../../answers/entities/answer.entity';

@Entity()
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Quiz, quiz => quiz.questions)
  @JoinColumn({ name: 'quiz_id' })
  quiz: Quiz;

  @Column({ name: 'quiz_id' })
  quizId: number;

  @Column()
  questionText: string;

  @Column('simple-array')
  options: string[];

  @Column()
  correctAnswer: string;

  @OneToMany(() => Answer, answer => answer.question)
  answers: Answer[];
} 