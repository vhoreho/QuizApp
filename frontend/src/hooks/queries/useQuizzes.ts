import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, teacherApi, studentApi, CreateQuizDto, UpdateQuizDto, UpdateQuestionDto } from "@/api/quizApi";
import { UserRole } from "@/lib/types";

// Ключи для запросов квизов
export const QUIZ_KEYS = {
  all: ["quizzes"] as const,
  lists: () => [...QUIZ_KEYS.all, "list"] as const,
  list: (filters: Record<string, unknown>) => [...QUIZ_KEYS.lists(), filters] as const,
  details: () => [...QUIZ_KEYS.all, "detail"] as const,
  detail: (id: number) => [...QUIZ_KEYS.details(), id] as const,
  results: (id: number) => [...QUIZ_KEYS.detail(id), "results"] as const,
  allResults: (filters?: Record<string, unknown>) => [...QUIZ_KEYS.all, "allResults", filters] as const,
  statistics: (id: number) => [...QUIZ_KEYS.detail(id), "statistics"] as const,
};

// Admin Quizzes
export const ADMIN_QUIZ_KEYS = {
  all: [...QUIZ_KEYS.all, 'admin'] as const,
  lists: () => [...ADMIN_QUIZ_KEYS.all, 'list'] as const,
  list: (filters: any) => [...ADMIN_QUIZ_KEYS.lists(), { ...filters }] as const,
  details: () => [...ADMIN_QUIZ_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...ADMIN_QUIZ_KEYS.details(), id] as const,
}

// Хуки для администратора
export const useAdminQuizzes = (filters?: { title?: string, isPublished?: boolean }) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ADMIN_QUIZ_KEYS.list(filters),
    queryFn: async () => {
      // Получаем все тесты
      const quizzes = await adminApi.getAllQuizzes(true);

      // Применяем фильтры, если они указаны
      let filteredQuizzes = [...quizzes];

      if (filters?.title) {
        filteredQuizzes = filteredQuizzes.filter(quiz =>
          quiz.title.toLowerCase().includes(filters.title!.toLowerCase())
        );
      }

      if (filters?.isPublished !== undefined) {
        filteredQuizzes = filteredQuizzes.filter(quiz =>
          quiz.isPublished === filters.isPublished
        );
      }

      return filteredQuizzes;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export const useAdminQuizById = (id: number) => {
  return useQuery({
    queryKey: QUIZ_KEYS.detail(id),
    queryFn: () => adminApi.getQuizById(id),
    enabled: !!id,
  });
};

export const useAdminQuizResults = (quizId: number) => {
  return useQuery({
    queryKey: QUIZ_KEYS.results(quizId),
    queryFn: () => adminApi.getQuizResults(quizId),
    enabled: !!quizId,
  });
};

export const useAdminQuizStatistics = (quizId: number) => {
  return useQuery({
    queryKey: QUIZ_KEYS.statistics(quizId),
    queryFn: () => adminApi.getQuizStatistics(quizId),
    enabled: !!quizId,
  });
};

export const useAllResults = (filters?: {
  username?: string;
  quizTitle?: string;
  dateFrom?: string;
  dateTo?: string;
}) => {
  return useQuery({
    queryKey: QUIZ_KEYS.allResults(filters),
    queryFn: () => adminApi.getAllResults(filters),
  });
};

export const useDeleteQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quizId: number) => {
      return adminApi.deleteQuiz(quizId);
    },
    onSuccess: (_, quizId) => {
      // Инвалидируем кэши, связанные с тестами
      queryClient.invalidateQueries({ queryKey: ADMIN_QUIZ_KEYS.lists() });

      // Удаляем данные удаленного теста из кэша
      queryClient.removeQueries({ queryKey: ADMIN_QUIZ_KEYS.detail(quizId) });
    }
  });
};

export const useUpdateQuizStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ quizId, isPublished }: { quizId: number, isPublished: boolean }) => {
      return adminApi.updateQuizStatus(quizId, isPublished);
    },
    onSuccess: (updatedQuiz) => {
      // Инвалидируем кэши, связанные с тестами
      queryClient.invalidateQueries({ queryKey: ADMIN_QUIZ_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: ADMIN_QUIZ_KEYS.detail(updatedQuiz.id) });

      // Обновляем кэш для конкретного теста
      queryClient.setQueryData(
        ADMIN_QUIZ_KEYS.detail(updatedQuiz.id),
        updatedQuiz
      );
    }
  });
};

export const useUpdateQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updateQuizDto }: { id: number; updateQuizDto: UpdateQuizDto }) =>
      adminApi.updateQuiz(id, updateQuizDto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUIZ_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: QUIZ_KEYS.detail(variables.id) });
    },
  });
};

// Хуки для преподавателя
export const useTeacherQuizzes = () => {
  return useQuery({
    queryKey: QUIZ_KEYS.list({ role: UserRole.TEACHER }),
    queryFn: () => teacherApi.getMyQuizzes(),
  });
};

export const useTeacherQuizById = (id: number) => {
  return useQuery({
    queryKey: QUIZ_KEYS.detail(id),
    queryFn: () => teacherApi.getQuizById(id),
    enabled: !!id,
  });
};

export const useTeacherQuizResults = (quizId: number) => {
  return useQuery({
    queryKey: QUIZ_KEYS.results(quizId),
    queryFn: () => teacherApi.getQuizResults(quizId),
    enabled: !!quizId,
  });
};

export const useTeacherQuizStatistics = (quizId: number) => {
  return useQuery({
    queryKey: QUIZ_KEYS.statistics(quizId),
    queryFn: () => teacherApi.getQuizStatistics(quizId),
    enabled: !!quizId,
  });
};

export const useTeacherDeleteQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => teacherApi.deleteQuiz(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUIZ_KEYS.lists() });
    },
  });
};

export const useTeacherUpdateQuizStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isPublished }: { id: number; isPublished: boolean }) =>
      teacherApi.updateQuizStatus(id, isPublished),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUIZ_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: QUIZ_KEYS.detail(variables.id) });
    },
  });
};

export const useTeacherUpdateQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updateQuizDto }: { id: number; updateQuizDto: UpdateQuizDto }) =>
      teacherApi.updateQuiz(id, updateQuizDto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUIZ_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: QUIZ_KEYS.detail(variables.id) });
    },
  });
};

export const useCreateQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (createQuizDto: CreateQuizDto) => teacherApi.createQuiz(createQuizDto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUIZ_KEYS.lists() });
    },
  });
};

// Хуки для студента
export const useAvailableQuizzes = () => {
  return useQuery({
    queryKey: QUIZ_KEYS.list({ role: UserRole.STUDENT }),
    queryFn: () => studentApi.getAvailableQuizzes(),
  });
};

export const useStudentDashboard = () => {
  return useQuery({
    queryKey: ["student", "dashboard"],
    queryFn: () => studentApi.getStudentDashboard(),
  });
};

export const useStudentQuizById = (id: number) => {
  return useQuery({
    queryKey: QUIZ_KEYS.detail(id),
    queryFn: () => studentApi.getQuizById(id),
    enabled: !!id,
  });
};

export const useStudentQuizQuestions = (quizId: number) => {
  return useQuery({
    queryKey: [...QUIZ_KEYS.detail(quizId), "questions"],
    queryFn: () => studentApi.getQuizQuestions(quizId),
    enabled: !!quizId,
  });
};

export const useStudentResults = () => {
  return useQuery({
    queryKey: ["student", "results"],
    queryFn: () => studentApi.getMyResults(),
  });
};

export const useSubmitQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quizId, answers }: { quizId: number; answers: any[] }) =>
      studentApi.submitQuiz(quizId, { quizId, answers }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student", "results"] });
    },
  });
};

// Хуки для работы с вопросами
export const useUpdateQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updateQuestionDto }: { id: number; updateQuestionDto: UpdateQuestionDto }) =>
      adminApi.updateQuestion(id, updateQuestionDto),
    onSuccess: (_, variables) => {
      // Инвалидируем запросы для обновления данных
      queryClient.invalidateQueries({ queryKey: QUIZ_KEYS.lists() });

      // При обновлении вопроса не знаем id теста, поэтому инвалидируем все детали
      queryClient.invalidateQueries({ queryKey: QUIZ_KEYS.details() });
    },
  });
};

export const useTeacherUpdateQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updateQuestionDto }: { id: number; updateQuestionDto: UpdateQuestionDto }) =>
      teacherApi.updateQuestion(id, updateQuestionDto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUIZ_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: QUIZ_KEYS.details() });
    },
  });
};

export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => adminApi.deleteQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUIZ_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: QUIZ_KEYS.details() });
    },
  });
};

export const useTeacherDeleteQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => teacherApi.deleteQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUIZ_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: QUIZ_KEYS.details() });
    },
  });
};

export const useTeacherMyResults = (filters?: {
  username?: string;
  quizTitle?: string;
  dateFrom?: string;
  dateTo?: string;
}) => {
  return useQuery({
    queryKey: ["teacher", "results", filters],
    queryFn: () => teacherApi.getMyResults(filters),
  });
}; 