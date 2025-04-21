import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/api/auth";
import { User, UserRole } from "@/lib/types";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

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

  return useMutation({
    mutationFn: (credentials: { username: string; password: string }) =>
      authApi.login(credentials),
    onSuccess: () => {
      // После успешного входа обновляем данные профиля
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.profile() });
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      queryClient.clear(); // Очищаем весь кэш при выходе
      navigate("/login");
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