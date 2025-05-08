import { useNavigate } from "react-router-dom";
import { UserRole } from "@/lib/types";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useRequireRole } from "@/hooks/queries/useAuth";
import { CategoryManagement } from "@/components/quiz/CategoryManagement";

export default function CategoryManagementPage() {
  const navigate = useNavigate();

  // Проверяем роль пользователя
  const { user, isLoading } = useRequireRole([UserRole.ADMIN]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-primary border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header user={user!} onLogout={() => {}} />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Управление категориями</h1>
            <p className="text-muted-foreground">
              Создавайте и управляйте категориями тестов в системе
            </p>
          </div>

          <CategoryManagement />
        </div>
      </main>

      <Footer />
    </div>
  );
}
