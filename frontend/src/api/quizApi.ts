import api from './axiosConfig';
import { User, Quiz, Question, Answer, Result, QuestionType, UserRole } from '../lib/types';
import type { QuizResult } from '../lib/types';

export interface SubmitQuizDto {
  quizId: number;
  answers: Answer[];
}

export interface CreateQuizDto {
  title: string;
  description: string;
  timeLimit?: number;
  isPublished?: boolean;
  questions?: CreateQuestionDto[];
}

export interface CreateQuestionDto {
  text: string;
  type: QuestionType;
  options?: string[];
  correctAnswer?: string;
  correctAnswers?: string[];
  matchingPairs?: { [key: string]: string };
  points: number;
  order: number;
  quizId: number;
}

export interface UpdateQuestionDto {
  text?: string;
  type?: QuestionType;
  options?: string[];
  correctAnswers?: string[];
  matchingPairs?: { [key: string]: string };
  points?: number;
  order?: number;
}

export interface UpdateQuizDto {
  title?: string;
  description?: string;
  timeLimit?: number;
  isPublished?: boolean;
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

  hasUserTakenQuiz: async (quizId: number): Promise<boolean> => {
    const response = await api.get(`/student/quizzes/${quizId}/has-taken`);
    return response.data.hasTaken;
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

  getResultAnswers: async (resultId: number): Promise<{ result: Result, answers: Answer[] }> => {
    const response = await api.get(`/student/results/${resultId}/answers`);
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

  importQuizFromFile: async (title: string, description: string, categoryId: number, questions: any[]): Promise<Quiz> => {
    try {
      console.log('Starting quiz import with:', { title, description, categoryId, questionsCount: questions.length });

      // Prepare questions for submission
      const preparedQuestions = questions.map((question, index) => {
        console.log(`Processing question ${index + 1}:`, {
          text: question.text?.substring(0, 30) + '...',
          type: question.type,
          correctAnswers: question.correctAnswers,
          options: question.options?.length
        });

        // Create base question DTO
        const questionDto: any = {
          text: question.text,
          type: question.type,
          order: index,
          points: question.points || 1,
          options: question.options || [],
        };

        // Add proper fields based on question type
        if (question.type === "SINGLE_CHOICE" || question.type === "TRUE_FALSE") {
          // For SINGLE_CHOICE and TRUE_FALSE, we need a single correctAnswer, not an array
          if (Array.isArray(question.correctAnswers) && question.correctAnswers.length > 0) {
            questionDto.correctAnswer = question.correctAnswers[0];
            // Remove correctAnswers array to avoid confusion with backend
            delete questionDto.correctAnswers;
            console.log(`Question ${index + 1} ${question.type} correctAnswer:`, questionDto.correctAnswer);
          } else {
            questionDto.correctAnswer = question.options[0] || "";
            console.log(`Question ${index + 1} No correctAnswers found, defaulting to first option`);
          }
        } else if (question.type === "MULTIPLE_CHOICE") {
          // For MULTIPLE_CHOICE, ensure correctAnswers is an array
          questionDto.correctAnswers = Array.isArray(question.correctAnswers)
            ? question.correctAnswers
            : (question.correctAnswers ? [question.correctAnswers] : []);
          // Remove any correctAnswer field to avoid confusion
          delete questionDto.correctAnswer;
          console.log(`Question ${index + 1} MULTIPLE_CHOICE correctAnswers:`, questionDto.correctAnswers);
        } else if (question.type === "MATCHING") {
          // For MATCHING, ensure matchingPairs is an object
          questionDto.matchingPairs = question.matchingPairs || {};
          // Remove any correctAnswer/correctAnswers to avoid confusion
          delete questionDto.correctAnswer;
          delete questionDto.correctAnswers;
          console.log(`Question ${index + 1} MATCHING matchingPairs:`, questionDto.matchingPairs);
        }

        return questionDto;
      });

      console.log(`Prepared ${preparedQuestions.length} questions for submission`);

      // Create the quiz with all questions in one request using the universal endpoint
      const quizResponse = await api.post('/quizzes', {
        title,
        description,
        categoryId,
        questions: preparedQuestions,
      });

      console.log('Quiz with questions created successfully:', quizResponse.data);
      return quizResponse.data;
    } catch (error) {
      console.error('Error importing quiz from file:', error);
      throw error;
    }
  },

  deleteQuiz: async (id: number): Promise<void> => {
    await api.delete(`/teacher/quizzes/${id}`);
  },

  addQuestion: async (quizId: number, createQuestionDto: CreateQuestionDto): Promise<Question> => {
    if (!createQuestionDto.quizId) {
      createQuestionDto = { ...createQuestionDto, quizId };
    }

    const response = await api.post(`/teacher/quizzes/${quizId}/questions`, createQuestionDto);
    return response.data;
  },

  updateQuestion: async (id: number, updateQuestionDto: UpdateQuestionDto): Promise<Question> => {
    const response = await api.patch(`/questions/${id}`, updateQuestionDto);
    return response.data;
  },

  deleteQuestion: async (id: number): Promise<void> => {
    await api.delete(`/questions/${id}`);
  },

  getQuizResults: async (quizId: number): Promise<Result[]> => {
    const response = await api.get(`/teacher/quizzes/${quizId}/results`);
    return response.data;
  },

  getQuizStatistics: async (quizId: number): Promise<any> => {
    const response = await api.get(`/teacher/quizzes/${quizId}/statistics`);
    return response.data;
  },

  updateQuizStatus: async (id: number, isPublished: boolean): Promise<Quiz> => {
    const response = await api.patch(`/teacher/quizzes/${id}/status`, { isPublished });
    return response.data;
  },

  updateQuiz: async (id: number, updateQuizDto: UpdateQuizDto): Promise<Quiz> => {
    const response = await api.patch(`/teacher/quizzes/${id}`, updateQuizDto);
    return response.data;
  },

  getMyResults: async (filters?: {
    username?: string;
    quizTitle?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<Result[]> => {
    let url = '/teacher/results';
    if (filters) {
      const queryParams = new URLSearchParams();
      if (filters.username) queryParams.append('username', filters.username);
      if (filters.quizTitle) queryParams.append('quizTitle', filters.quizTitle);
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);

      const queryString = queryParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    const response = await api.get(url);
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

  updateUserRole: async (id: number, role: UserRole): Promise<User> => {
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

  getQuizById: async (id: number): Promise<Quiz> => {
    const response = await api.get(`/admin/quizzes/${id}`);
    return response.data;
  },

  createQuiz: async (createQuizDto: CreateQuizDto): Promise<Quiz> => {
    const response = await api.post('/admin/quizzes', createQuizDto);
    return response.data;
  },

  addQuestion: async (quizId: number, createQuestionDto: CreateQuestionDto): Promise<Question> => {
    if (!createQuestionDto.quizId) {
      createQuestionDto = { ...createQuestionDto, quizId };
    }

    const response = await api.post(`/admin/quizzes/${quizId}/questions`, createQuestionDto);
    return response.data;
  },

  deleteQuiz: async (id: number): Promise<void> => {
    await api.delete(`/admin/quizzes/${id}`);
  },

  updateQuizStatus: async (id: number, isPublished: boolean): Promise<Quiz> => {
    const response = await api.patch(`/admin/quizzes/${id}/status`, { isPublished });
    return response.data;
  },

  getQuizResults: async (quizId: number): Promise<Result[]> => {
    const response = await api.get(`/admin/quizzes/${quizId}/results`);
    return response.data;
  },

  getQuizStatistics: async (quizId: number): Promise<any> => {
    const response = await api.get(`/admin/quizzes/${quizId}/statistics`);
    return response.data;
  },

  getDashboardStats: async (excludeCurrentUser: boolean = true, publishedOnly: boolean = true) => {
    try {
      const response = await api.get(`/admin/stats?excludeCurrentUser=${excludeCurrentUser}&publishedOnly=${publishedOnly}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  getAllResults: async (filters?: {
    username?: string;
    quizTitle?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<Result[]> => {
    let url = '/admin/results';
    if (filters) {
      const queryParams = new URLSearchParams();
      if (filters.username) queryParams.append('username', filters.username);
      if (filters.quizTitle) queryParams.append('quizTitle', filters.quizTitle);
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);

      const queryString = queryParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    const response = await api.get(url);
    return response.data;
  },

  updateQuiz: async (id: number, updateQuizDto: UpdateQuizDto): Promise<Quiz> => {
    const response = await api.patch(`/admin/quizzes/${id}`, updateQuizDto);
    return response.data;
  },

  updateQuestion: async (id: number, updateQuestionDto: UpdateQuestionDto): Promise<Question> => {
    const response = await api.patch(`/questions/${id}`, updateQuestionDto);
    return response.data;
  },

  deleteQuestion: async (id: number): Promise<void> => {
    await api.delete(`/questions/${id}`);
  },

  importQuizFromFile: async (title: string, description: string, categoryId: number, questions: any[]): Promise<Quiz> => {
    try {
      console.log('Starting quiz import with:', { title, description, categoryId, questionsCount: questions.length });

      // Prepare questions for submission
      const preparedQuestions = questions.map((question, index) => {
        console.log(`Processing question ${index + 1}:`, {
          text: question.text?.substring(0, 30) + '...',
          type: question.type,
          correctAnswers: question.correctAnswers,
          options: question.options?.length
        });

        // Create base question DTO
        const questionDto: any = {
          text: question.text,
          type: question.type,
          order: index,
          points: question.points || 1,
          options: question.options || [],
        };

        // Add proper fields based on question type
        if (question.type === "SINGLE_CHOICE" || question.type === "TRUE_FALSE") {
          // For SINGLE_CHOICE and TRUE_FALSE, we need a single correctAnswer, not an array
          if (Array.isArray(question.correctAnswers) && question.correctAnswers.length > 0) {
            questionDto.correctAnswer = question.correctAnswers[0];
            // Remove correctAnswers array to avoid confusion with backend
            delete questionDto.correctAnswers;
            console.log(`Question ${index + 1} ${question.type} correctAnswer:`, questionDto.correctAnswer);
          } else {
            questionDto.correctAnswer = question.options[0] || "";
            console.log(`Question ${index + 1} No correctAnswers found, defaulting to first option`);
          }
        } else if (question.type === "MULTIPLE_CHOICE") {
          // For MULTIPLE_CHOICE, ensure correctAnswers is an array
          questionDto.correctAnswers = Array.isArray(question.correctAnswers)
            ? question.correctAnswers
            : (question.correctAnswers ? [question.correctAnswers] : []);
          // Remove any correctAnswer field to avoid confusion
          delete questionDto.correctAnswer;
          console.log(`Question ${index + 1} MULTIPLE_CHOICE correctAnswers:`, questionDto.correctAnswers);
        } else if (question.type === "MATCHING") {
          // For MATCHING, ensure matchingPairs is an object
          questionDto.matchingPairs = question.matchingPairs || {};
          // Remove any correctAnswer/correctAnswers to avoid confusion
          delete questionDto.correctAnswer;
          delete questionDto.correctAnswers;
          console.log(`Question ${index + 1} MATCHING matchingPairs:`, questionDto.matchingPairs);
        }

        return questionDto;
      });

      console.log(`Prepared ${preparedQuestions.length} questions for submission`);

      // Create the quiz with all questions in one request using the universal endpoint
      const quizResponse = await api.post('/quizzes', {
        title,
        description,
        categoryId,
        questions: preparedQuestions,
      });

      console.log('Quiz with questions created successfully:', quizResponse.data);
      return quizResponse.data;
    } catch (error) {
      console.error('Error importing quiz from file:', error);
      throw error;
    }
  },
};

// Universal Quiz API
export const quizApi = {
  createQuiz: async (createQuizDto: CreateQuizDto): Promise<Quiz> => {
    try {
      console.log('Creating quiz with questions:', createQuizDto.title, createQuizDto.questions?.length);

      // Make a deep copy of the DTO to avoid modifying the original
      const dto = JSON.parse(JSON.stringify(createQuizDto));

      // Process each question to ensure arrays are properly handled
      if (dto.questions) {
        dto.questions = dto.questions.map((q: any, index: number) => {
          // Ensure options array is properly set
          if (q.options && Array.isArray(q.options)) {
            // Make sure every option is a string
            q.options = q.options.map((opt: any) => String(opt));
          }

          // Handle question type-specific fields
          if (q.type === QuestionType.MULTIPLE_CHOICE) {
            if (q.correctAnswers && Array.isArray(q.correctAnswers)) {
              // Make sure every correctAnswer is a string
              q.correctAnswers = q.correctAnswers.map((ans: any) => String(ans));
            }
          } else if (q.type === QuestionType.SINGLE_CHOICE || q.type === QuestionType.TRUE_FALSE) {
            // Ensure correctAnswer is a string
            if (q.correctAnswer) {
              q.correctAnswer = String(q.correctAnswer);
            }
          }

          return q;
        });
      }

      console.log('Sending create quiz request with:', dto);

      const response = await api.post('/quizzes', dto);

      console.log('Quiz created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating quiz:', error);
      throw error;
    }
  },

  getAllQuizzes: async (withDetails: boolean = false): Promise<Quiz[]> => {
    const response = await api.get(`/quizzes`);
    return response.data;
  },

  getQuizById: async (id: number): Promise<Quiz> => {
    const response = await api.get(`/quizzes/${id}`);
    return response.data;
  },

  addQuestion: async (quizId: number, createQuestionDto: CreateQuestionDto): Promise<Question> => {
    if (!createQuestionDto.quizId) {
      createQuestionDto = { ...createQuestionDto, quizId };
    }

    const response = await api.post(`/quizzes/${quizId}/questions`, createQuestionDto);
    return response.data;
  },

  updateQuizStatus: async (id: number, isPublished: boolean): Promise<Quiz> => {
    const response = await api.patch(`/quizzes/${id}/status`, { isPublished });
    return response.data;
  },

  updateQuiz: async (id: number, updateQuizDto: UpdateQuizDto): Promise<Quiz> => {
    const response = await api.patch(`/quizzes/${id}`, updateQuizDto);
    return response.data;
  },

  deleteQuiz: async (id: number): Promise<void> => {
    await api.delete(`/quizzes/${id}`);
  },

  getQuizResults: async (quizId: number): Promise<Result[]> => {
    const response = await api.get(`/quizzes/${quizId}/results`);
    return response.data;
  },

  getQuizStatistics: async (quizId: number): Promise<any> => {
    const response = await api.get(`/quizzes/${quizId}/statistics`);
    return response.data;
  },

  updateQuestion: async (id: number, updateQuestionDto: UpdateQuestionDto): Promise<Question> => {
    const response = await api.patch(`/questions/${id}`, updateQuestionDto);
    return response.data;
  },

  deleteQuestion: async (id: number): Promise<void> => {
    await api.delete(`/questions/${id}`);
  },

  importQuizFromFile: async (title: string, description: string, categoryId: number, questions: any[]): Promise<Quiz> => {
    try {
      console.log('Starting quiz import with:', { title, description, categoryId, questionsCount: questions.length });

      // Prepare questions for submission
      const preparedQuestions = questions.map((question, index) => {
        console.log(`Processing question ${index + 1}:`, {
          text: question.text?.substring(0, 30) + '...',
          type: question.type,
          correctAnswers: question.correctAnswers,
          options: question.options?.length
        });

        // Create base question DTO
        const questionDto: any = {
          text: question.text,
          type: question.type,
          order: index,
          points: question.points || 1,
          options: question.options || [],
        };

        // Add proper fields based on question type
        if (question.type === "SINGLE_CHOICE" || question.type === "TRUE_FALSE") {
          // For SINGLE_CHOICE and TRUE_FALSE, we need a single correctAnswer, not an array
          if (Array.isArray(question.correctAnswers) && question.correctAnswers.length > 0) {
            questionDto.correctAnswer = question.correctAnswers[0];
            // Remove correctAnswers array to avoid confusion with backend
            delete questionDto.correctAnswers;
            console.log(`Question ${index + 1} ${question.type} correctAnswer:`, questionDto.correctAnswer);
          } else {
            questionDto.correctAnswer = question.options[0] || "";
            console.log(`Question ${index + 1} No correctAnswers found, defaulting to first option`);
          }
        } else if (question.type === "MULTIPLE_CHOICE") {
          // For MULTIPLE_CHOICE, ensure correctAnswers is an array
          questionDto.correctAnswers = Array.isArray(question.correctAnswers)
            ? question.correctAnswers
            : (question.correctAnswers ? [question.correctAnswers] : []);
          // Remove any correctAnswer field to avoid confusion
          delete questionDto.correctAnswer;
          console.log(`Question ${index + 1} MULTIPLE_CHOICE correctAnswers:`, questionDto.correctAnswers);
        } else if (question.type === "MATCHING") {
          // For MATCHING, ensure matchingPairs is an object
          questionDto.matchingPairs = question.matchingPairs || {};
          // Remove any correctAnswer/correctAnswers to avoid confusion
          delete questionDto.correctAnswer;
          delete questionDto.correctAnswers;
          console.log(`Question ${index + 1} MATCHING matchingPairs:`, questionDto.matchingPairs);
        }

        return questionDto;
      });

      console.log(`Prepared ${preparedQuestions.length} questions for submission`);

      // Create the quiz with all questions in one request using the universal endpoint
      const quizResponse = await api.post('/quizzes', {
        title,
        description,
        categoryId,
        questions: preparedQuestions,
      });

      console.log('Quiz with questions created successfully:', quizResponse.data);
      return quizResponse.data;
    } catch (error) {
      console.error('Error importing quiz from file:', error);
      throw error;
    }
  },
}; 