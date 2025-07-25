import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../../users/entities/user.entity';
import { Question } from '../../questions/entities/question.entity';
import { Result } from '../../results/entities/result.entity';
import { Subject } from '../../subjects/entities/subject.entity';

@Entity()
export class Quiz {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @ManyToOne(() => Subject, (subject) => subject.quizzes)
  @JoinColumn({ name: 'subjectId' })
  subject: Subject;

  @Column({ name: 'subjectId' })
  subjectId: number;

  @Column({ nullable: true })
  timeLimit?: number;

  @Column({ nullable: true })
  passingScore?: number;

  @ManyToOne(() => User, (user) => user.quizzes)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column({ name: 'createdById' })
  createdById: number;

  @Column({ default: false })
  isPublished: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Question, (question) => question.quiz, { cascade: true })
  questions: Question[];

  @OneToMany(() => Result, (result) => result.quiz, { cascade: true })
  results: Result[];
}
