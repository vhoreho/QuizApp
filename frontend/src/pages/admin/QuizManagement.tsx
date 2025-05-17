import { useNavigate } from "react-router-dom";
import { Header } from "../../components/layout/header";
import { Footer } from "../../components/layout/footer";
import { Button } from "../../components/ui/button";
import {
  ArrowLeftIcon,
  ReaderIcon,
  PlusIcon,
  TableIcon,
  StackIcon,
  MixerHorizontalIcon,
  CheckCircledIcon,
  Cross2Icon,
  UploadIcon,
} from "@radix-ui/react-icons";
import { useRequireRole, useLogout } from "@/hooks/queries/useAuth";
import { UserRole, User } from "@/lib/types";
import { ROUTES } from "@/lib/constants";
import {
  useAdminQuizzes,
  useDeleteQuiz,
  useUpdateQuizStatus,
} from "@/hooks/queries/useQuizzes";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuizManager } from "@/components/quiz/QuizManager";

export default function AdminQuizManagement() {
  const navigate = useNavigate();
  const logoutMutation = useLogout();

  // Проверяем доступ и получаем профиль пользователя
  const {
    user,
    isLoading: isUserLoading,
    hasAccess,
  } = useRequireRole([UserRole.ADMIN]);

  // Получаем список всех тестов в системе
  const { data: quizzes = [], isLoading: isQuizzesLoading } = useAdminQuizzes(
    {}
  );
  console.log("🚀 ~ AdminQuizManagement ~ quizzes:", quizzes);

  // Мутации для действий с тестами
  const deleteQuizMutation = useDeleteQuiz();
  const updateQuizStatusMutation = useUpdateQuizStatus();

  const isLoading = isUserLoading || isQuizzesLoading;

  // Подсчет статистики тестов
  const publishedQuizzes = quizzes.filter((quiz) => quiz.isPublished).length;
  const draftQuizzes = quizzes.length - publishedQuizzes;

  // Обработчики действий для компонента таблицы
  const handleDeleteQuiz = async (quizId: number) => {
    return deleteQuizMutation.mutateAsync(quizId);
  };

  const handleUpdateQuizStatus = async (
    quizId: number,
    isPublished: boolean
  ) => {
    return updateQuizStatusMutation.mutateAsync({ quizId, isPublished });
  };

  const handleCreateQuiz = () => {
    navigate(ROUTES.CREATE_QUIZ);
  };

  const handleImportQuiz = () => {
    navigate(ROUTES.IMPORT_QUIZ);
  };

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  };

  // Проверка валидности пользователя
  const isValidUser = (user: any): user is User => {
    return (
      user &&
      typeof user === "object" &&
      "id" in user &&
      "username" in user &&
      "role" in user
    );
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
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <Button
              variant="ghost"
              className="flex items-center text-muted-foreground w-fit hover:bg-muted/30 transition-colors group"
              onClick={() => navigate("/admin/dashboard")}
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Назад
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                <div className="bg-blue-100 dark:bg-blue-900 p-1.5 rounded-full">
                  <ReaderIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                Управление тестами
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Просмотр и управление всеми тестами в системе
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="border border-border bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950 dark:to-sky-950 shadow-md hover:shadow-lg transition-all duration-300 group overflow-hidden">
              <CardHeader className="py-4 pb-0 relative">
                <div className="absolute top-0 right-0 -mt-6 -mr-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <StackIcon className="h-24 w-24 text-blue-500 rotate-12" />
                </div>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <div className="bg-blue-100 dark:bg-blue-900 p-1 rounded-full">
                    <StackIcon className="h-3.5 w-3.5 text-blue-500" />
                  </div>
                  Всего тестов
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3 pb-4">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                  {quizzes.length}
                </div>
                <div className="text-xs text-muted-foreground mt-1 flex items-center">
                  <TableIcon className="h-3 w-3 mr-1 text-blue-500" />
                  <span>Управление всеми тестами</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 shadow-md hover:shadow-lg transition-all duration-300 group overflow-hidden">
              <CardHeader className="py-4 pb-0 relative">
                <div className="absolute top-0 right-0 -mt-6 -mr-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <CheckCircledIcon className="h-24 w-24 text-green-500 rotate-12" />
                </div>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <div className="bg-green-100 dark:bg-green-900 p-1 rounded-full">
                    <CheckCircledIcon className="h-3.5 w-3.5 text-green-500" />
                  </div>
                  Опубликовано
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3 pb-4">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors">
                  {publishedQuizzes}
                </div>
                <div className="flex gap-2 mt-2">
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300"
                  >
                    {Math.round((publishedQuizzes / quizzes.length) * 100) || 0}
                    % от всех тестов
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950 shadow-md hover:shadow-lg transition-all duration-300 group overflow-hidden">
              <CardHeader className="py-4 pb-0 relative">
                <div className="absolute top-0 right-0 -mt-6 -mr-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <MixerHorizontalIcon className="h-24 w-24 text-amber-500 rotate-12" />
                </div>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <div className="bg-amber-100 dark:bg-amber-900 p-1 rounded-full">
                    <MixerHorizontalIcon className="h-3.5 w-3.5 text-amber-500" />
                  </div>
                  Черновики
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3 pb-4">
                <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
                  {draftQuizzes}
                </div>
                <div className="text-xs text-muted-foreground mt-1 flex items-center">
                  <Cross2Icon className="h-3 w-3 mr-1 text-amber-500" />
                  <span>Не опубликованные тесты</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-950/40 dark:to-sky-950/40 border border-blue-100 dark:border-blue-800/30 rounded-lg p-1 mb-6">
            <div className="flex flex-wrap gap-2 p-3">
              <Button
                onClick={handleCreateQuiz}
                className="bg-blue-600 hover:bg-blue-700 text-white group"
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                Создать новый тест
              </Button>

              <Button
                onClick={handleImportQuiz}
                variant="outline"
                className="border-blue-200 dark:border-blue-700 group"
              >
                <UploadIcon className="mr-2 h-4 w-4 group-hover:animate-bounce" />
                Импортировать из файла
              </Button>

              <Button
                onClick={() => navigate("/admin/subjects")}
                variant="outline"
                className="border-blue-200 dark:border-blue-700 group"
              >
                <MixerHorizontalIcon className="mr-2 h-4 w-4 group-hover:animate-bounce" />
                Управление предметами
              </Button>
            </div>
          </div>

          <div className="border border-blue-100 dark:border-blue-800/30 rounded-lg bg-white/80 dark:bg-slate-950/80 shadow-md overflow-hidden">
            <QuizManager
              title="Все тесты"
              description="Список всех тестов в системе"
              userRole={UserRole.ADMIN}
              quizzes={quizzes}
              isLoading={isLoading}
              onCreateQuiz={handleCreateQuiz}
              onDeleteQuiz={handleDeleteQuiz}
              onUpdateQuizStatus={handleUpdateQuizStatus}
              defaultView="table"
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
