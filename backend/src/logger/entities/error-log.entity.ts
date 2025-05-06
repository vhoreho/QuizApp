import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('error_logs')
export class ErrorLog {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  timestamp: Date;

  @Column()
  errorMessage: string;

  @Column({ nullable: true, type: 'text' })
  stackTrace: string;

  @Column()
  source: string; // 'frontend' или 'backend'

  @Column({ nullable: true })
  userId: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // Дополнительные данные

  @Column({ nullable: true })
  url: string;

  @Column({ default: 1 })
  occurrences: number; // Счетчик повторений одинаковых ошибок
} 