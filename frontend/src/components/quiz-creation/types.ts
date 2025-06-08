import { QuestionType } from "@/lib/types";

export interface QuestionFormState {
  text: string;
  options: string[];
  correctAnswer: string;
  correctAnswers?: string[];
  matchingPairs?: { [key: string]: string };
  points: number;
  order: number;
  type: QuestionType;
} 