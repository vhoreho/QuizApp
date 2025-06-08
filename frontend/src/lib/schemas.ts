import { z } from "zod";
import { QuestionType } from "./types";

// Quiz form schema
export const quizFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
});

export type QuizFormValues = z.infer<typeof quizFormSchema>;

// Question form schema
export const questionFormSchema = z.object({
  questionText: z.string().min(1, { message: "Question text is required" }),
  options: z.array(z.string().min(1, { message: "Option is required" })).min(2, {
    message: "At least 2 options are required",
  }),
  correctAnswer: z.string().min(1, { message: "Correct answer is required" }),
});

export type QuestionFormValues = z.infer<typeof questionFormSchema>;

// Submit quiz schema
export const submitAnswerSchema = z.object({
  questionId: z.number(),
  questionType: z.nativeEnum(QuestionType),
  selectedAnswer: z.string().optional(),
  selectedAnswers: z.array(z.string()).optional(),
  matchingPairs: z.record(z.string()).optional(),
  textAnswer: z.string().optional(),
});

export type SubmitAnswerValues = z.infer<typeof submitAnswerSchema>;

export const submitQuizSchema = z.object({
  quizId: z.number(),
  answers: z.array(submitAnswerSchema),
});

export type SubmitQuizValues = z.infer<typeof submitQuizSchema>; 