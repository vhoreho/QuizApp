import { useNavigate } from "react-router-dom";
import { UserRole } from "../lib/types";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";
import api from "@/api/axiosConfig";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, PersonIcon } from "@radix-ui/react-icons";
import { Header } from "../components/layout/header";
import { Footer } from "../components/layout/footer";
// Импортируем компоненты из новой директории
import {
  UserStatisticsCards,
  CreateUserForm,
  UsersTable,
} from "@/components/user-management";

// Основной компонент управления пользователями
export default function UserManagement() {
  const navigate = useNavigate();
  const { user: currentUser, isLoading: userLoading } = useUser();

  // Хук для получения списка пользователей
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await api.get("/users");
      return response.data;
    },
    // Не запрашивать данные, если пользователь не админ
    enabled:
      !userLoading && !!currentUser && currentUser.role === UserRole.ADMIN,
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Если данные загружаются или пользователь не админ, показать загрузку
  if (
    isLoading ||
    userLoading ||
    !currentUser ||
    currentUser.role !== UserRole.ADMIN
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-primary border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header user={currentUser} onLogout={handleLogout} />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              className="flex items-center text-muted-foreground mr-4 hover:bg-muted/30 transition-colors group"
              onClick={() => navigate("/admin/dashboard")}
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Назад
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <div className="bg-indigo-100 dark:bg-indigo-900 p-1.5 rounded-full">
                  <PersonIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                Управление пользователями
              </h1>
              <p className="text-muted-foreground">
                Создание и управление учетными записями пользователей
              </p>
            </div>
          </div>

          {/* Статистика пользователей */}
          <UserStatisticsCards users={users} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Форма создания пользователя */}
            <CreateUserForm />

            {/* Таблица пользователей */}
            <UsersTable users={users} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
