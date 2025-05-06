export enum UserRole {
  ADMIN = 'administrator',
  TEACHER = 'teacher',
  STUDENT = 'student'
}

export interface User {
  id: number;
  username: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
}

export enum QuestionType {
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  MATCHING = 'MATCHING',
  TRUE_FALSE = 'TRUE_FALSE'
}

export interface Question {
  id: number;
  text: string;
  type: QuestionType;
  options: string[];
  correctAnswers?: string[];
  matchingPairs?: { [key: string]: string };
  quizId: number;
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
  questionId: number;
  questionType: QuestionType;
  selectedAnswer?: string;
  selectedAnswers?: string[];
  matchingPairs?: { [key: string]: string };
  textAnswer?: string;
}

export interface QuizResult {
  quizId: number;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  totalPoints?: number;
  maxPossiblePoints?: number;
  partialPoints?: number;
}

export interface Result {
  id: number;
  quizId: number;
  userId: number;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  totalPoints: number;
  maxPossiblePoints: number;
  createdAt: string;
  isPractice?: boolean;
  user?: User;
  quiz?: Quiz;
}

export interface Group {
  id: number;
  name: string;
  description: string;
  createdById: number;
  studentIds: number[];
} 