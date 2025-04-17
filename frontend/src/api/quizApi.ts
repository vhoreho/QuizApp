import api from './axiosConfig';
import { User, Quiz, Question, Answer, Result, QuestionType } from '../lib/types';

export interface SubmitQuizDto {
  answers: Answer[];
}

export interface QuizResult {
  quizId: number;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
}

export interface CreateQuizDto {
  title: string;
  description: string;
  timeLimit?: number;
  isPublished?: boolean;
}

export interface CreateQuestionDto {
  text: string;
  type: QuestionType;
  options?: string[];
  correctAnswer: string;
  points: number;
  order: number;
}

export interface UpdateQuestionDto {
  text?: string;
  type?: QuestionType;
  options?: string[];
  correctAnswer?: string;
  points?: number;
  order?: number;
}

// Student API
export const studentApi = {
  getAvailableQuizzes: async (): Promise<Quiz[]> => {
    const response = await api.get('/student/quizzes');
    return response.data;
  },

  getQuizById: async (id: number): Promise<Quiz> => {
    const response = await api.get(`/student/quizzes/${id}`);
    return response.data;
  },

  getQuizQuestions: async (quizId: number): Promise<Question[]> => {
    const response = await api.get(`/student/quizzes/${quizId}/questions`);
    return response.data;
  },

  submitQuiz: async (quizId: number, submitQuizDto: SubmitQuizDto): Promise<QuizResult> => {
    const response = await api.post(`/student/quizzes/${quizId}/submit`, submitQuizDto);
    return response.data;
  },

  getMyResults: async (): Promise<Result[]> => {
    const response = await api.get('/student/results');
    return response.data;
  },

  getResultById: async (id: number): Promise<Result> => {
    const response = await api.get(`/student/results/${id}`);
    return response.data;
  },

  getStudentDashboard: async (): Promise<any> => {
    const response = await api.get('/student/dashboard');
    return response.data;
  }
};

// Teacher API
export const teacherApi = {
  getMyQuizzes: async (): Promise<Quiz[]> => {
    const response = await api.get('/teacher/quizzes');
    return response.data;
  },

  getQuizById: async (id: number): Promise<Quiz> => {
    const response = await api.get(`/teacher/quizzes/${id}`);
    return response.data;
  },

  createQuiz: async (createQuizDto: CreateQuizDto): Promise<Quiz> => {
    const response = await api.post('/teacher/quizzes', createQuizDto);
    return response.data;
  },

  deleteQuiz: async (id: number): Promise<void> => {
    await api.delete(`/teacher/quizzes/${id}`);
  },

  addQuestion: async (quizId: number, createQuestionDto: CreateQuestionDto): Promise<Question> => {
    const response = await api.post(`/teacher/quizzes/${quizId}/questions`, createQuestionDto);
    return response.data;
  },

  updateQuestion: async (id: number, updateQuestionDto: UpdateQuestionDto): Promise<Question> => {
    const response = await api.put(`/teacher/questions/${id}`, updateQuestionDto);
    return response.data;
  },

  deleteQuestion: async (id: number): Promise<void> => {
    await api.delete(`/teacher/questions/${id}`);
  },

  getQuizResults: async (quizId: number): Promise<Result[]> => {
    const response = await api.get(`/teacher/quizzes/${quizId}/results`);
    return response.data;
  },

  getQuizStatistics: async (quizId: number): Promise<any> => {
    const response = await api.get(`/teacher/quizzes/${quizId}/statistics`);
    return response.data;
  }
};

// Admin API
export const adminApi = {
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  getUserById: async (id: number): Promise<User> => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  updateUserRole: async (id: number, role: string): Promise<User> => {
    const response = await api.put(`/admin/users/${id}/role`, { role });
    return response.data;
  },

  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/admin/users/${id}`);
  },

  getAllQuizzes: async (withDetails: boolean = false): Promise<Quiz[]> => {
    const response = await api.get(`/admin/quizzes?withDetails=${withDetails}`);
    return response.data;
  },

  deleteQuiz: async (id: number): Promise<void> => {
    await api.delete(`/admin/quizzes/${id}`);
  },

  getDashboardStats: async () => {
    try {
      const response = await api.get('/admin/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }
}; 