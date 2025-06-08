import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { UserRole } from "../lib/types";
import { Loader2 } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, isLoading } = useUser();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-gray-600">Загрузка...</span>
      </div>
    );
  }

  if (!user) {
    // Сохраняем URL, на который пытался перейти пользователь
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (
    allowedRoles &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role)
  ) {
    // Если недостаточно прав, перенаправляем на соответствующую страницу
    return <Navigate to="/not-authorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
