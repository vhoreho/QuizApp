import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/api/auth";
import { User, UserRole } from "@/lib/types";
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
  const queryClient = useQueryClient();

  const query = useQuery<User>({
    queryKey: AUTH_KEYS.profile(),
    queryFn: authApi.getProfile,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true, // Always enabled, but we'll handle the error case
  });

  // Handle errors
  useEffect(() => {
    if (query.error) {
      console.error("Error fetching user profile:", query.error);
      localStorage.removeItem("user");
      navigate("/login", { replace: true });
      // Clear all queries on auth error
      queryClient.clear();
    }
  }, [query.error, navigate, queryClient]);

  return query;
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  const { updateUser } = useUser();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (credentials: { username: string; password: string }) =>
      authApi.login(credentials),
    onSuccess: (data) => {
      // Update user data in context
      updateUser(data.user);
      // Invalidate profile data after successful login
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.profile() });
      // Navigate to appropriate page based on user role
      const redirectPath = getRedirectPathForRole(data.user.role);
      navigate(redirectPath, { replace: true });
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { logout } = useUser();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: async () => {
      // Call logout from context
      await logout();

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

      // Navigate to login using React Router
      navigate("/login", { replace: true });
    },
  });
};

// Helper function to determine redirect path based on user role
function getRedirectPathForRole(role: UserRole): string {
  switch (role) {
    case "administrator":
      return "/admin/dashboard";
    case "teacher":
      return "/teacher/dashboard";
    case "student":
      return "/student/dashboard";
    default:
      return "/";
  }
}

// Role check hook
export const useRequireRole = (allowedRoles?: UserRole[]) => {
  const { data: user, isLoading, error } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      // Access is allowed for any authenticated user if no roles specified
      const hasAccess = !allowedRoles || allowedRoles.includes(user.role);

      if (!hasAccess) {
        navigate("/not-authorized", { replace: true });
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