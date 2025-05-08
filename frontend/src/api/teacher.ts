import { Quiz, QuizCategory } from "@/lib/types";
import axiosInstance from "./axiosConfig";

interface CreateQuizDto {
  title: string;
  description: string;
  category: QuizCategory;
  timeLimit?: number;
  passingScore?: number;
}

export const teacherApi = {
  createQuiz: async (data: CreateQuizDto): Promise<Quiz> => {
    const response = await axiosInstance.post<Quiz>("/api/teacher/quizzes", data);
    return response.data;
  },
}; 