import { useNavigate } from "react-router-dom";
import { Header } from "../../components/layout/header";
import { Button } from "../../components/ui/button";
import { ArrowLeftIcon, UploadIcon } from "@radix-ui/react-icons";
import { useRequireRole } from "@/hooks/queries/useAuth";
import { useLogout } from "@/hooks/queries/useAuth";
import { UserRole, User } from "@/lib/types";
import { ROUTES } from "@/lib/constants";
import {
  useTeacherQuizzes,
  useTeacherDeleteQuiz,
  useTeacherUpdateQuizStatus,
} from "@/hooks/queries/useQuizzes";
import QuizManagementTable from "@/components/quiz/QuizManagementTable";
import { isValidUser } from "@/lib/utils";

export default function TeacherQuizManagement() {
  const navigate = useNavigate();

  // Проверяем доступ и получаем профиль пользователя
  const {
    user,
    isLoading: isUserLoading,
    hasAccess,
  } = useRequireRole([UserRole.TEACHER]);

  // Получаем список тестов преподавателя
  const { data: quizzes = [], isLoading: isQuizzesLoading } =
    useTeacherQuizzes();

  // Мутации для действий с тестами
  const deleteQuizMutation = useTeacherDeleteQuiz();
  const updateQuizStatusMutation = useTeacherUpdateQuizStatus();
  const logoutMutation = useLogout();

  const isLoading = isUserLoading || isQuizzesLoading;

  const handleDeleteQuiz = async (quizId: number) => {
    return deleteQuizMutation.mutateAsync(quizId);
  };

  const handleUpdateQuizStatus = async (
    quizId: number,
    isPublished: boolean
  ) => {
    return updateQuizStatusMutation.mutateAsync({ id: quizId, isPublished });
  };

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  };

  const handleCreateQuiz = () => {
    navigate(ROUTES.CREATE_QUIZ);
  };

  const handleImportQuiz = () => {
    navigate(ROUTES.IMPORT_QUIZ);
  };

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
      <Header user={isValidUser(user) ? user : null} onLogout={handleLogout} />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              className="flex items-center text-muted-foreground mr-4"
              onClick={() => navigate("/teacher/dashboard")}
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Назад
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Мои тесты</h1>
              <p className="text-muted-foreground">
                Управление созданными вами тестами
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 mb-6">
            <Button variant="outline" onClick={handleImportQuiz}>
              <UploadIcon className="mr-2 h-4 w-4" /> Импортировать тест
            </Button>
            <Button onClick={handleCreateQuiz}>Создать новый тест</Button>
          </div>

          <QuizManagementTable
            userRole={UserRole.TEACHER}
            quizzes={quizzes}
            isLoading={isLoading}
            onCreateQuiz={handleCreateQuiz}
            onDeleteQuiz={handleDeleteQuiz}
            onUpdateQuizStatus={handleUpdateQuizStatus}
          />
        </div>
      </main>

      <footer className="border-t border-border bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Quiz App. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
