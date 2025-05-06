import { useNavigate } from "react-router-dom";
import { UserRole } from "../lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ReaderIcon,
  PersonIcon,
  CheckboxIcon,
  BarChartIcon,
  BookmarkIcon,
  MixerHorizontalIcon,
  PlusIcon,
  GearIcon,
  MagnifyingGlassIcon,
  Pencil1Icon,
  PlayIcon,
  QuestionMarkCircledIcon,
  FileTextIcon,
  PieChartIcon,
} from "@radix-ui/react-icons";
import { Header } from "../components/layout/header";
import { useRequireRole, useLogout } from "@/hooks/queries/useAuth";
import { useTeacherQuizzes } from "@/hooks/queries/useQuizzes";
import { Badge } from "@/components/ui/badge";

export default function TeacherDashboard() {
  const navigate = useNavigate();

  // Проверяем роль и получаем профиль пользователя
  const { user, isLoading: isUserLoading } = useRequireRole([UserRole.TEACHER]);
  const logoutMutation = useLogout();

  // Получаем список тестов преподавателя
  const { data: quizzes = [], isLoading: isQuizzesLoading } =
    useTeacherQuizzes();

  const isLoading = isUserLoading || isQuizzesLoading;

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  };

  // Вычисляем статистику тестов
  const getPublishedQuizzesCount = () => {
    return quizzes.filter((quiz) => quiz.isPublished).length;
  };

  if (isLoading) {
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
      <Header user={user!} onLogout={handleLogout} />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                <div className="bg-primary/10 p-1.5 rounded-full">
                  <PersonIcon className="h-6 w-6 text-primary" />
                </div>
                Панель преподавателя
              </h1>
              <p className="text-muted-foreground">
                Управление тестами и группами студентов
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => navigate("/create-quiz")}
                className="flex items-center gap-2 bg-primary/5 hover:bg-primary/10 border-primary/20"
              >
                <PlusIcon className="h-4 w-4" />
                Создать тест
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/teacher/quizzes")}
                className="flex items-center gap-2 bg-muted/30 hover:bg-muted/50"
              >
                <ReaderIcon className="h-4 w-4" />
                Мои тесты
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* My Quizzes Card */}
            <Card
              withSticky
              className="border border-border bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950 dark:to-purple-950 shadow-md hover:shadow-lg transition-all duration-300 group overflow-hidden"
            >
              <CardHeader>
                <div className="absolute top-2 right-2 opacity-5 group-hover:opacity-10 transition-opacity">
                  <ReaderIcon className="h-32 w-32 text-violet-500 rotate-12" />
                </div>
                <CardTitle className="flex items-center group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                  <div className="bg-violet-100 p-2 rounded-full mr-2 dark:bg-violet-900">
                    <ReaderIcon className="h-5 w-5 text-violet-500" />
                  </div>
                  Мои тесты
                </CardTitle>
                <CardDescription>Управление вашими тестами</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-4">
                  <p className="text-sm">
                    Создавайте, редактируйте и управляйте своими тестами для
                    студентов.
                  </p>
                  <div className="flex items-center text-sm">
                    <Pencil1Icon className="h-4 w-4 mr-2 text-violet-500" />
                    <span>Редактирование тестов</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <GearIcon className="h-4 w-4 mr-2 text-violet-500" />
                    <span>Настройка параметров</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gradient-to-r from-violet-50/50 to-violet-100/50 dark:from-violet-950/50 dark:to-violet-900/50 border-t border-violet-100 dark:border-violet-800/30">
                <Button
                  onClick={() => navigate("/teacher/quizzes")}
                  className="w-full bg-violet-600 hover:bg-violet-700 group"
                >
                  <FileTextIcon className="h-4 w-4 mr-2 group-hover:animate-pulse" />
                  Управление тестами
                </Button>
              </CardFooter>
            </Card>

            {/* Student Performance Card */}
            <Card
              withSticky
              className="border border-border bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 shadow-md hover:shadow-lg transition-all duration-300 group overflow-hidden"
            >
              <CardHeader>
                <div className="absolute top-2 right-2 opacity-5 group-hover:opacity-10 transition-opacity">
                  <PieChartIcon className="h-32 w-32 text-amber-500 rotate-12" />
                </div>
                <CardTitle className="flex items-center group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  <div className="bg-amber-100 p-2 rounded-full mr-2 dark:bg-amber-900">
                    <BarChartIcon className="h-5 w-5 text-amber-500" />
                  </div>
                  Успеваемость студентов
                </CardTitle>
                <CardDescription>
                  Аналитика результатов тестирования
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-4">
                  <p className="text-sm">
                    Просматривайте аналитику и отчеты по успеваемости ваших
                    студентов.
                  </p>
                  <div className="flex items-center text-sm">
                    <BarChartIcon className="h-4 w-4 mr-2 text-amber-500" />
                    <span>Статистика выполнения</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <PieChartIcon className="h-4 w-4 mr-2 text-amber-500" />
                    <span>Диаграммы успеваемости</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gradient-to-r from-amber-50/50 to-amber-100/50 dark:from-amber-950/50 dark:to-amber-900/50 border-t border-amber-100 dark:border-amber-800/30">
                <Button
                  onClick={() => navigate("/teacher/analytics")}
                  className="w-full bg-amber-600 hover:bg-amber-700 group"
                >
                  <BarChartIcon className="h-4 w-4 mr-2 group-hover:animate-pulse" />
                  Просмотр аналитики
                </Button>
              </CardFooter>
            </Card>
          </div>
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
