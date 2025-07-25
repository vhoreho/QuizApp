export enum UserRole {
  ADMIN = "administrator",
  TEACHER = "teacher",
  STUDENT = "student",
}

export interface User {
  id: number;
  username: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
}

export enum QuestionType {
  SINGLE_CHOICE = "SINGLE_CHOICE",
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
  MATCHING = "MATCHING",
  TRUE_FALSE = "TRUE_FALSE",
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

export enum QuizSubject {
  PROGRAMMING = "programming",
  MATHEMATICS = "mathematics",
  SCIENCE = "science",
  LANGUAGES = "languages",
  HISTORY = "history",
  LITERATURE = "literature",
  OTHER = "other",
}

export interface QuizSubjectInfo {
  id: QuizSubject;
  name: string;
  icon: string;
}

export const QUIZ_SUBJECTS: QuizSubjectInfo[] = [
  {
    id: QuizSubject.PROGRAMMING,
    name: "Программирование",
    icon: "💻",
  },
  {
    id: QuizSubject.MATHEMATICS,
    name: "Математика",
    icon: "📐",
  },
  {
    id: QuizSubject.SCIENCE,
    name: "Естественные науки",
    icon: "🔬",
  },
  {
    id: QuizSubject.LANGUAGES,
    name: "Языки",
    icon: "🌍",
  },
  {
    id: QuizSubject.HISTORY,
    name: "История",
    icon: "📜",
  },
  {
    id: QuizSubject.LITERATURE,
    name: "Литература",
    icon: "📚",
  },
  {
    id: QuizSubject.OTHER,
    name: "Другое",
    icon: "📌",
  },
];

export interface Subject {
  id: number;
  name: string;
  quizCount?: number;
}

export interface Quiz {
  id: number;
  title: string;
  description: string;
  subject: string;
  subjectId: number;
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

export interface LoginData {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: User;
}

export interface RegisterUserData {
  name: string;
  username: string;
  password: string;
  role: UserRole;
}
