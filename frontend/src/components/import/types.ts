import { Question } from "@/lib/types";

export interface ImportProgressState {
  isLoading: boolean;
  error: string | null;
  importProgress: number;
  importStatus: string;
  importStep: number;
}

export interface ExampleData {
  json: any;
  csv: string;
}

export interface QuestionParserResult {
  quizTitle: string;
  quizDescription: string;
  questions: Question[];
} 