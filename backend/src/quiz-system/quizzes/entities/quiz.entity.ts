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
import { Category } from '../../categories/entities/category.entity';

@Entity()
export class Quiz {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @ManyToOne(() => Category, (category) => category.quizzes)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ name: 'category_id' })
  categoryId: number;

  @Column({ nullable: true })
  timeLimit?: number;

  @Column({ nullable: true })
  passingScore?: number;

  @ManyToOne(() => User, (user) => user.quizzes)
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column({ name: 'created_by_id' })
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
