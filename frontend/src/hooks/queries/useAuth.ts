import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/api/auth";
import { User, UserRole } from "@/lib/types";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useUser } from "@/contexts/UserContext";

const AUTH_KEYS = {
  all: ["auth"] as const,
  profile: () => [...AUTH_KEYS.all, "profile"] as const,
};

export const useProfile = () => {
  const navigate = useNavigate();

  const query = useQuery<User>({
    queryKey: AUTH_KEYS.profile(),
    queryFn: authApi.getProfile,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    // Не делаем запрос, если нет токена авторизации
    enabled: !!localStorage.getItem('token'),
  });

  // Обрабатываем ошибки через useEffect
  useEffect(() => {
    if (query.error) {
      console.error("Error fetching user profile:", query.error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  }, [query.error, navigate]);

  return query;
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  const { updateUser } = useUser();

  return useMutation({
    mutationFn: (credentials: { username: string; password: string }) =>
      authApi.login(credentials),
    onSuccess: (data) => {
      // Обновляем данные пользователя в контексте
      updateUser(data.user);
      // После успешного входа обновляем данные профиля
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.profile() });
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { logout } = useUser();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Вызываем logout из контекста
      logout();

      // Инвалидируем все основные ключи запросов
      // Auth
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.all });

      // Основные категории данных
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["results"] });
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });

      // Студенческие данные
      queryClient.invalidateQueries({ queryKey: ["student"] });

      // Данные преподавателя
      queryClient.invalidateQueries({ queryKey: ["teacher"] });

      // Ответы на тесты
      queryClient.invalidateQueries({ queryKey: ["resultAnswers"] });

      // Для сохранения места в локальном хранилище, полностью очищаем кэш
      // Это наиболее простой и надежный способ обновить все данные при следующем логине
      queryClient.clear();

      // Используем window.location.href для гарантированного перехода на страницу логина
      window.location.href = "/login";
    },
  });
};

// Создаем повторно используемую функцию для проверки роли
export const useRequireRole = (allowedRoles?: UserRole[]) => {
  const { data: user, isLoading, error } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      // Если роли не указаны, то доступ разрешен любому аутентифицированному пользователю
      const hasAccess = !allowedRoles || allowedRoles.includes(user.role);

      if (!hasAccess) {
        navigate("/not-authorized");
      }
    }
  }, [user, isLoading, allowedRoles, navigate]);

  if (error) {
    return { user: null, isLoading, hasAccess: false };
  }

  if (!isLoading && user) {
    const hasAccess = !allowedRoles || allowedRoles.includes(user.role);
    return { user, isLoading, hasAccess };
  }

  return { user: null, isLoading, hasAccess: false };
}; 