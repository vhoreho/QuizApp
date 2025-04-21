import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/api/quizApi";

// Ключи для запросов статистики
export const STATS_KEYS = {
  all: ["stats"] as const,
  dashboard: () => [...STATS_KEYS.all, "dashboard"] as const,
};

// Хук для получения статистики дашборда админа
export const useAdminDashboardStats = () => {
  return useQuery({
    queryKey: STATS_KEYS.dashboard(),
    queryFn: () => adminApi.getDashboardStats(),
    staleTime: 5 * 60 * 1000, // 5 минут
  });
}; 