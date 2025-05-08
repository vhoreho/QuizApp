import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
  AfterLoad,
} from 'typeorm';
import { Quiz } from '../../quizzes/entities/quiz.entity';
import { Answer } from '../../answers/entities/answer.entity';
import { QuestionType } from '../enums/question-type.enum';

@Entity()
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Quiz, (quiz) => quiz.questions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quiz_id' })
  quiz: Quiz;

  @Column({ name: 'quiz_id' })
  quizId: number;

  @Column()
  text: string;

  @Column({
    type: 'enum',
    enum: QuestionType,
    default: QuestionType.SINGLE_CHOICE,
  })
  type: QuestionType;

  @Column('json', { nullable: true, default: '[]' })
  options: string[];

  @Column('json', { nullable: true, default: '[]' })
  correctAnswers: string[];

  @Column({ nullable: true })
  points: number;

  @Column({ default: 0 })
  order: number;

  @OneToMany(() => Answer, (answer) => answer.question, { onDelete: 'CASCADE' })
  answers: Answer[];
}
