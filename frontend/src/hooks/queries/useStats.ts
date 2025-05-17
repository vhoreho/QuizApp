import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/api/quizApi";

// Ключи для запросов статистики
export const STATS_KEYS = {
  all: ["stats"] as const,
  dashboard: (excludeCurrentUser?: boolean, publishedOnly?: boolean) =>
    [...STATS_KEYS.all, "dashboard", excludeCurrentUser, publishedOnly] as const,
  quizAttempts: (dateRange?: string) => [...STATS_KEYS.all, "quizAttempts", dateRange] as const,
  userActivity: (dateRange?: string) => [...STATS_KEYS.all, "userActivity", dateRange] as const,
  resultsDistribution: () => [...STATS_KEYS.all, "resultsDistribution"] as const,
};

// Хук для получения статистики дашборда админа
export const useAdminDashboardStats = (
  excludeCurrentUser: boolean = true,
  publishedOnly: boolean = true
) => {
  return useQuery({
    queryKey: STATS_KEYS.dashboard(excludeCurrentUser, publishedOnly),
    queryFn: () => adminApi.getDashboardStats(excludeCurrentUser, publishedOnly),
    staleTime: 3600, // 5 минут
  });
};

// Хук для получения данных о попытках прохождения тестов
export const useQuizAttemptsStats = (dateRange?: string) => {
  return useQuery({
    queryKey: STATS_KEYS.quizAttempts(dateRange),
    queryFn: () => {
      // Здесь мы бы сделали запрос на сервер для получения реальных данных
      // Сейчас возвращаем моковые данные для демонстрации
      return Promise.resolve({
        lastWeek: [
          { date: "Пн", attempts: 12 },
          { date: "Вт", attempts: 19 },
          { date: "Ср", attempts: 15 },
          { date: "Чт", attempts: 22 },
          { date: "Пт", attempts: 30 },
          { date: "Сб", attempts: 8 },
          { date: "Вс", attempts: 7 },
        ],
        byQuiz: [
          { name: "Тест по математике", attempts: 42 },
          { name: "Тест по физике", attempts: 35 },
          { name: "Тест по химии", attempts: 28 },
          { name: "Тест по биологии", attempts: 22 },
          { name: "Тест по истории", attempts: 18 },
        ],
      });
    },
    staleTime: 10 * 60 * 1000, // 10 минут
  });
};

// Хук для получения данных об активности пользователей
export const useUserActivityStats = (dateRange?: string) => {
  return useQuery({
    queryKey: STATS_KEYS.userActivity(dateRange),
    queryFn: () => {
      // Здесь мы бы сделали запрос на сервер для получения реальных данных
      // Сейчас возвращаем моковые данные для демонстрации
      return Promise.resolve({
        lastWeek: [
          { date: "Пн", logins: 25, registrations: 5 },
          { date: "Вт", logins: 32, registrations: 3 },
          { date: "Ср", logins: 28, registrations: 2 },
          { date: "Чт", logins: 35, registrations: 8 },
          { date: "Пт", logins: 42, registrations: 4 },
          { date: "Сб", logins: 18, registrations: 2 },
          { date: "Вс", logins: 15, registrations: 1 },
        ],
        userRoles: [
          { name: "Студенты", value: 120 },
          { name: "Преподаватели", value: 25 },
          { name: "Администраторы", value: 5 },
        ],
      });
    },
    staleTime: 10 * 60 * 1000, // 10 минут
  });
};

// Хук для получения распределения результатов тестов
export const useResultsDistributionStats = () => {
  return useQuery({
    queryKey: STATS_KEYS.resultsDistribution(),
    queryFn: () => {
      // Здесь мы бы сделали запрос на сервер для получения реальных данных
      // Сейчас возвращаем моковые данные для демонстрации
      return Promise.resolve({
        scoreRanges: [
          { range: "0-20%", count: 15 },
          { range: "21-40%", count: 25 },
          { range: "41-60%", count: 45 },
          { range: "61-80%", count: 35 },
          { range: "81-100%", count: 30 },
        ],
        averageByQuiz: [
          { name: "Тест по математике", average: 68 },
          { name: "Тест по физике", average: 72 },
          { name: "Тест по химии", average: 65 },
          { name: "Тест по биологии", average: 75 },
          { name: "Тест по истории", average: 82 },
        ],
      });
    },
    staleTime: 15 * 60 * 1000, // 15 минут
  });
}; 