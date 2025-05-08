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

export enum QuizCategory {
  PROGRAMMING = "programming",
  MATHEMATICS = "mathematics",
  SCIENCE = "science",
  LANGUAGES = "languages",
  HISTORY = "history",
  LITERATURE = "literature",
  OTHER = "other"
}

export interface QuizCategoryInfo {
  id: QuizCategory;
  name: string;
  description: string;
  icon: string;
}

export const QUIZ_CATEGORIES: QuizCategoryInfo[] = [
  {
    id: QuizCategory.PROGRAMMING,
    name: "Программирование",
    description: "Тесты по различным языкам программирования и технологиям",
    icon: "💻"
  },
  {
    id: QuizCategory.MATHEMATICS,
    name: "Математика",
    description: "Тесты по алгебре, геометрии и другим разделам математики",
    icon: "📐"
  },
  {
    id: QuizCategory.SCIENCE,
    name: "Естественные науки",
    description: "Тесты по физике, химии, биологии и другим наукам",
    icon: "🔬"
  },
  {
    id: QuizCategory.LANGUAGES,
    name: "Языки",
    description: "Тесты по иностранным языкам и лингвистике",
    icon: "🌍"
  },
  {
    id: QuizCategory.HISTORY,
    name: "История",
    description: "Тесты по всемирной истории и историческим событиям",
    icon: "📜"
  },
  {
    id: QuizCategory.LITERATURE,
    name: "Литература",
    description: "Тесты по литературе, писателям и произведениям",
    icon: "📚"
  },
  {
    id: QuizCategory.OTHER,
    name: "Другое",
    description: "Различные тесты, не вошедшие в другие категории",
    icon: "📌"
  }
];

export interface Quiz {
  id: number;
  title: string;
  description: string;
  category: QuizCategory;
  timeLimit?: number;
  passingScore?: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  questions: Question[];
}

export interface Answer {
  id?: number;
  questionId: number;
  questionType: QuestionType;
  selectedAnswer?: string;
  selectedAnswers?: string[];
  matchingPairs?: { [key: string]: string };
  textAnswer?: string;
  isCorrect?: boolean;
  partialScore?: number;
  question?: Question;
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