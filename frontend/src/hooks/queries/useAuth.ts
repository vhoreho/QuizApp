import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/api/auth";
import { User } from "@/lib/types";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { hasAuthCookie } from "@/utils/authCheck";

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
    // Only make the request if auth cookie exists
    enabled: hasAuthCookie(),
  });

  // Handle errors
  useEffect(() => {
    if (query.error) {
      console.error("Error fetching user profile:", query.error);
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
      // Call logout from context
      logout();

      // Invalidate all queries
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["results"] });
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["student"] });
      queryClient.invalidateQueries({ queryKey: ["teacher"] });
      queryClient.invalidateQueries({ queryKey: ["resultAnswers"] });

      // Clear query cache
      queryClient.clear();

      // Redirect to login
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