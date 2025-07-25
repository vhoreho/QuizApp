import { Quiz, QuizSubject } from "@/lib/types";
import axiosInstance from "./axiosConfig";

export interface CreateQuizDto {
  title: string;
  description: string;
  subjectId: number;
  timeLimit?: number;
  isPublished?: boolean;
}

export const teacherApi = {
  createQuiz: async (data: CreateQuizDto): Promise<Quiz> => {
    const response = await axiosInstance.post<Quiz>("/api/teacher/quizzes", data);
    return response.data;
  },
}; 