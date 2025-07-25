import { useNavigate } from "react-router-dom";
import { UserRole, User } from "../lib/types";
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
  CheckIcon,
  PersonIcon,
  BarChartIcon,
  StarIcon,
  RocketIcon,
  MagnifyingGlassIcon,
  BookmarkIcon,
  PlayIcon,
  PieChartIcon,
  ExternalLinkIcon,
} from "@radix-ui/react-icons";
import { Header } from "../components/layout/header";
import { useRequireRole, useLogout } from "@/hooks/queries/useAuth";
import { useStudentDashboard } from "@/hooks/queries/useQuizzes";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { isValidUser } from "@/lib/utils";

export default function StudentDashboard() {
  const navigate = useNavigate();

  // Проверяем роль и получаем профиль пользователя
  const { user, isLoading: isUserLoading } = useRequireRole([UserRole.STUDENT]);
  const logoutMutation = useLogout();

  // Получаем данные для дашборда студента
  const { data: performance, isLoading: isPerformanceLoading } =
    useStudentDashboard();

  const isLoading = isUserLoading || isPerformanceLoading;

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  };

  // Функция для получения цвета оценки
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500 text-green-700 dark:text-green-300";
    if (score >= 60) return "bg-blue-500 text-blue-700 dark:text-blue-300";
    if (score >= 40)
      return "bg-yellow-500 text-yellow-700 dark:text-yellow-300";
    return "bg-red-500 text-red-700 dark:text-red-300";
  };

  // Функция для получения статуса оценки
  const getScoreStatus = (score: number) => {
    if (score >= 80) return "Отлично";
    if (score >= 60) return "Хорошо";
    if (score >= 40) return "Удовлетворительно";
    return "Неудовлетворительно";
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
      <Header user={isValidUser(user) ? user : null} onLogout={handleLogout} />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                <div className="bg-primary/10 p-1.5 rounded-full">
                  <PersonIcon className="h-6 w-6 text-primary" />
                </div>
                Панель студента
              </h1>
              <p className="text-muted-foreground">
                Прохождение тестов и отслеживание прогресса
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => navigate("/student/quizzes")}
                className="flex items-center gap-2 bg-primary/5 hover:bg-primary/10 border-primary/20"
              >
                <PlayIcon className="h-4 w-4" />
                Начать тест
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/student/results")}
                className="flex items-center gap-2 bg-muted/30 hover:bg-muted/50"
              >
                <BarChartIcon className="h-4 w-4" />
                Результаты
              </Button>
            </div>
          </div>

          {performance && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card className="border border-border bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 shadow-md hover:shadow-lg transition-all duration-300 group overflow-hidden">
                <CardHeader className="py-4 pb-0 relative">
                  <div className="absolute top-0 right-0 -mt-6 -mr-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <BookmarkIcon className="h-24 w-24 text-primary rotate-12" />
                  </div>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <div className="bg-primary/10 p-1 rounded-full">
                      <BookmarkIcon className="h-3.5 w-3.5 text-primary" />
                    </div>
                    Пройдено тестов
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3 pb-4">
                  <div className="text-3xl font-bold group-hover:text-primary transition-colors">
                    {performance.totalQuizzes}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {performance.totalQuizzes > 0
                      ? `${Math.round(
                          (performance.quizzesPassed /
                            performance.totalQuizzes) *
                            100
                        )}% успешно`
                      : "Нет данных"}
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-border bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 shadow-md hover:shadow-lg transition-all duration-300 group overflow-hidden">
                <CardHeader className="py-4 pb-0 relative">
                  <div className="absolute top-0 right-0 -mt-6 -mr-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <BarChartIcon className="h-24 w-24 text-blue-500 rotate-12" />
                  </div>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <div className="bg-blue-100 dark:bg-blue-900 p-1 rounded-full">
                      <BarChartIcon className="h-3.5 w-3.5 text-blue-500" />
                    </div>
                    Средний балл
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3 pb-4">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {performance.averageScore
                      ? performance.averageScore.toFixed(1)
                      : "0"}
                  </div>
                  <div className="mt-2">
                    <Progress
                      value={performance.averageScore || 0}
                      className="h-1.5 bg-blue-200 dark:bg-blue-800"
                    />
                    <div className="text-xs text-muted-foreground mt-1 flex justify-between">
                      <span>0%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-border bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 shadow-md hover:shadow-lg transition-all duration-300 group overflow-hidden">
                <CardHeader className="py-4 pb-0 relative">
                  <div className="absolute top-0 right-0 -mt-6 -mr-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <CheckIcon className="h-24 w-24 text-green-500 rotate-12" />
                  </div>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <div className="bg-green-100 dark:bg-green-900 p-1 rounded-full">
                      <CheckIcon className="h-3.5 w-3.5 text-green-500" />
                    </div>
                    Успешно сдано
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3 pb-4">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {performance.quizzesPassed}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {performance.totalQuizzes > 0
                      ? `из ${performance.totalQuizzes} тестов`
                      : "Нет данных"}
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-border bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 shadow-md hover:shadow-lg transition-all duration-300 group overflow-hidden">
                <CardHeader className="py-4 pb-0 relative">
                  <div className="absolute top-0 right-0 -mt-6 -mr-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <StarIcon className="h-24 w-24 text-amber-500 rotate-12" />
                  </div>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <div className="bg-amber-100 dark:bg-amber-900 p-1 rounded-full">
                      <StarIcon className="h-3.5 w-3.5 text-amber-500" />
                    </div>
                    Лучший результат
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3 pb-4">
                  <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                    {performance.highestScore
                      ? performance.highestScore.toFixed(1)
                      : "0"}
                  </div>
                  {performance.highestScore && performance.highestScore > 0 && (
                    <Badge className="mt-1 bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                      {getScoreStatus(performance.highestScore)}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Assigned Quizzes Card */}
            <Card className="border border-border bg-gradient-to-br from-sky-50 to-indigo-50 dark:from-sky-950 dark:to-indigo-950 shadow-md hover:shadow-lg transition-all duration-300 group overflow-hidden">
              <CardHeader>
                <div className="absolute top-2 right-2 opacity-5 group-hover:opacity-10 transition-opacity">
                  <RocketIcon className="h-32 w-32 text-indigo-500 rotate-12" />
                </div>
                <CardTitle className="flex items-center group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  <div className="bg-indigo-100 p-2 rounded-full mr-2 dark:bg-indigo-900">
                    <ReaderIcon className="h-5 w-5 text-indigo-500" />
                  </div>
                  Мои тесты
                </CardTitle>
                <CardDescription>Назначенные вам тесты</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm">
                    Просматривайте и проходите тесты, назначенные вам
                    преподавателями.
                  </p>
                  <div className="flex items-center text-sm">
                    <ExternalLinkIcon className="h-4 w-4 mr-2 text-indigo-500" />
                    <span>Проверьте свои знания</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <MagnifyingGlassIcon className="h-4 w-4 mr-2 text-indigo-500" />
                    <span>Ищите тесты по темам</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gradient-to-r from-indigo-50/50 to-indigo-100/50 dark:from-indigo-950/50 dark:to-indigo-900/50 border-t border-indigo-100 dark:border-indigo-800/30">
                <Button
                  onClick={() => navigate("/student/quizzes")}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 group"
                >
                  <PlayIcon className="h-4 w-4 mr-2 group-hover:animate-pulse" />
                  Перейти к тестам
                </Button>
              </CardFooter>
            </Card>

            {/* Results Card */}
            <Card className="border border-border bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 shadow-md hover:shadow-lg transition-all duration-300 group overflow-hidden">
              <CardHeader>
                <div className="absolute top-2 right-2 opacity-5 group-hover:opacity-10 transition-opacity">
                  <PieChartIcon className="h-32 w-32 text-amber-500 rotate-12" />
                </div>
                <CardTitle className="flex items-center group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  <div className="bg-amber-100 p-2 rounded-full mr-2 dark:bg-amber-900">
                    <BarChartIcon className="h-5 w-5 text-amber-500" />
                  </div>
                  Мои результаты
                </CardTitle>
                <CardDescription>Результаты пройденных тестов</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm">
                    Просматривайте результаты и анализируйте свой прогресс в
                    обучении.
                  </p>
                  <div className="flex items-center text-sm">
                    <CheckIcon className="h-4 w-4 mr-2 text-amber-500" />
                    <span>Отслеживайте успеваемость</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <StarIcon className="h-4 w-4 mr-2 text-amber-500" />
                    <span>Сравнивайте лучшие результаты</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gradient-to-r from-amber-50/50 to-amber-100/50 dark:from-amber-950/50 dark:to-amber-900/50 border-t border-amber-100 dark:border-amber-800/30">
                <Button
                  onClick={() => navigate("/student/results")}
                  className="w-full bg-amber-600 hover:bg-amber-700 group"
                >
                  <BarChartIcon className="h-4 w-4 mr-2 group-hover:animate-pulse" />
                  Просмотр результатов
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
