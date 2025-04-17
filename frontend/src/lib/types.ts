export enum UserRole {
  ADMIN = 'administrator',
  TEACHER = 'teacher',
  STUDENT = 'student',
}

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  role: UserRole;
}

export enum QuestionType {
  SINGLE_CHOICE = 'single_choice',
  MULTIPLE_CHOICE = 'multiple_choice',
  OPEN_ENDED = 'open_ended',
  MATCHING = 'matching',
  ORDERING = 'ordering',
}

export interface Question {
  id: number;
  quizId: number;
  text: string;
  type: QuestionType;
  options?: string[];
  correctAnswer?: string | string[];
  points: number;
  order: number;
}

export interface Quiz {
  id: number;
  title: string;
  description: string;
  timeLimit?: number;
  createdById: number;
  questions: Question[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Answer {
  id: number;
  questionId: number;
  userId: number;
  answer: string | string[];
  isCorrect?: boolean;
  points?: number;
}

export interface Result {
  id: number;
  quizId: number;
  userId: number;
  score: number;
  totalPoints: number;
  completedAt: string;
}

export interface Group {
  id: number;
  name: string;
  description: string;
  createdById: number;
  studentIds: number[];
} 