import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { User, UserRole } from "../lib/types";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasRequiredRole, setHasRequiredRole] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const userJson = localStorage.getItem("user");

      if (!token || !userJson) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // Проверяем роль, если указаны допустимые роли
      if (allowedRoles && allowedRoles.length > 0) {
        try {
          const user = JSON.parse(userJson) as User;
          const hasRole = allowedRoles.includes(user.role);
          setHasRequiredRole(hasRole);
        } catch (error) {
          console.error("Failed to parse user JSON:", error);
          setHasRequiredRole(false);
        }
      }

      setIsAuthenticated(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [allowedRoles]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-gray-600">Загрузка...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Сохраняем URL, на который пытался перейти пользователь
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!hasRequiredRole) {
    // Если недостаточно прав, перенаправляем на соответствующую страницу
    return <Navigate to="/not-authorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
