import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/api/quizApi";
import { User, UserRole } from "@/lib/types";

// Ключи для запросов пользователей
export const USER_KEYS = {
  all: ["users"] as const,
  lists: () => [...USER_KEYS.all, "list"] as const,
  list: (filters: any) => [...USER_KEYS.lists(), { ...filters }] as const,
  details: () => [...USER_KEYS.all, "detail"] as const,
  detail: (id: number) => [...USER_KEYS.details(), id] as const,
};

// Хук для получения всех пользователей с возможностью фильтрации
export const useUsers = (filters?: {
  username?: string,
  role?: UserRole,
  nameContains?: string
}) => {
  return useQuery({
    queryKey: USER_KEYS.list(filters),
    queryFn: async () => {
      // Получаем всех пользователей
      const users = await adminApi.getAllUsers();

      // Если фильтры не указаны, возвращаем всех пользователей
      if (!filters) return users;

      // Применяем фильтрацию
      return users.filter(user => {
        let matchesFilter = true;

        if (filters.username && matchesFilter) {
          matchesFilter = user.username.toLowerCase().includes(filters.username.toLowerCase());
        }

        if (filters.role && matchesFilter) {
          matchesFilter = user.role === filters.role;
        }

        if (filters.nameContains && matchesFilter) {
          const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
          matchesFilter = fullName.includes(filters.nameContains.toLowerCase());
        }

        return matchesFilter;
      });
    },
    staleTime: 1000 * 60 * 5, // 5 минут
  });
};

// Хук для получения конкретного пользователя по ID
export const useUserById = (id: number) => {
  return useQuery({
    queryKey: USER_KEYS.detail(id),
    queryFn: () => adminApi.getUserById(id),
    enabled: !!id, // Включить запрос только если передан ID
    staleTime: 1000 * 60 * 5, // 5 минут
  });
};

// Хук для обновления роли пользователя
export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: number, role: UserRole }) => {
      return adminApi.updateUserRole(userId, role);
    },
    onSuccess: (updatedUser) => {
      // Инвалидируем кэши, связанные с пользователями
      queryClient.invalidateQueries({ queryKey: USER_KEYS.lists() });

      // Обновляем кэш для конкретного пользователя
      queryClient.setQueryData(
        USER_KEYS.detail(updatedUser.id),
        updatedUser
      );
    }
  });
};

// Хук для удаления пользователя
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: number) => {
      return adminApi.deleteUser(userId);
    },
    onSuccess: (_, userId) => {
      // Инвалидируем кэши, связанные с пользователями
      queryClient.invalidateQueries({ queryKey: USER_KEYS.lists() });

      // Удаляем данные удаленного пользователя из кэша
      queryClient.removeQueries({ queryKey: USER_KEYS.detail(userId) });
    }
  });
}; 