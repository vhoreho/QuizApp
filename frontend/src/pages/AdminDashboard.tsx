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
  PersonIcon,
  ReaderIcon,
  BarChartIcon,
  DashboardIcon,
  GearIcon,
  MixerHorizontalIcon,
  PlusIcon,
  CheckCircledIcon,
  StackIcon,
  TableIcon,
  MagnifyingGlassIcon,
  ListBulletIcon,
} from "@radix-ui/react-icons";
import { Header } from "../components/layout/header";
import { useRequireRole, useLogout } from "@/hooks/queries/useAuth";
import { useAdminDashboardStats } from "@/hooks/queries/useStats";
import { Badge } from "@/components/ui/badge";
import { isValidUser } from "@/lib/utils";

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Проверяем роль и получаем профиль пользователя
  const { user, isLoading: isUserLoading } = useRequireRole([UserRole.ADMIN]);
  const logoutMutation = useLogout();

  // Получаем статистику для дашборда
  const { data: stats, isLoading: isStatsLoading } = useAdminDashboardStats();

  const isLoading = isUserLoading || isStatsLoading;

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
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
                  <GearIcon className="h-6 w-6 text-primary" />
                </div>
                Панель администратора
              </h1>
              <p className="text-muted-foreground">
                Управление всей системой тестирования
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => navigate("/admin/quizzes")}
                className="flex items-center gap-2 bg-primary/5 hover:bg-primary/10 border-primary/20"
              >
                <ReaderIcon className="h-4 w-4" />
                Управление тестами
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/admin/users")}
                className="flex items-center gap-2 bg-muted/30 hover:bg-muted/50"
              >
                <PersonIcon className="h-4 w-4" />
                Пользователи
              </Button>
            </div>
          </div>

          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card
                withSticky
                className="border border-border bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 shadow-md hover:shadow-lg transition-all duration-300 group overflow-hidden"
              >
                <CardHeader className="py-4 pb-0 relative">
                  <div className="absolute top-0 right-0 -mt-6 -mr-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <PersonIcon className="h-24 w-24 text-indigo-500 rotate-12" />
                  </div>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <div className="bg-indigo-100 dark:bg-indigo-900 p-1 rounded-full">
                      <PersonIcon className="h-3.5 w-3.5 text-indigo-500" />
                    </div>
                    Пользователи
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3 pb-4">
                  <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                    {stats.userCount}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Badge
                      variant="outline"
                      className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300"
                    >
                      {stats.usersByRole?.student || 0} студентов
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-purple-50 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                    >
                      {stats.usersByRole?.teacher || 0} преподавателей
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card
                withSticky
                className="border border-border bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950 dark:to-sky-950 shadow-md hover:shadow-lg transition-all duration-300 group overflow-hidden"
              >
                <CardHeader className="py-4 pb-0 relative">
                  <div className="absolute top-0 right-0 -mt-6 -mr-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <StackIcon className="h-24 w-24 text-blue-500 rotate-12" />
                  </div>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <div className="bg-blue-100 dark:bg-blue-900 p-1 rounded-full">
                      <StackIcon className="h-3.5 w-3.5 text-blue-500" />
                    </div>
                    Тесты
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3 pb-4">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                    {stats.quizCount}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center">
                    <PlusIcon className="h-3 w-3 mr-1 text-green-500" />
                    <span>Разнообразные тестовые материалы</span>
                  </div>
                </CardContent>
              </Card>

              <Card
                withSticky
                className="border border-border bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950 dark:to-teal-950 shadow-md hover:shadow-lg transition-all duration-300 group overflow-hidden"
              >
                <CardHeader className="py-4 pb-0 relative">
                  <div className="absolute top-0 right-0 -mt-6 -mr-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <TableIcon className="h-24 w-24 text-green-500 rotate-12" />
                  </div>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <div className="bg-green-100 dark:bg-green-900 p-1 rounded-full">
                      <TableIcon className="h-3.5 w-3.5 text-green-500" />
                    </div>
                    Результаты
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3 pb-4">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors">
                    {stats.resultCount}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center">
                    <CheckCircledIcon className="h-3 w-3 mr-1 text-green-500" />
                    <span>Завершенных тестирований</span>
                  </div>
                </CardContent>
              </Card>

              <Card
                withSticky
                className="border border-border bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 shadow-md hover:shadow-lg transition-all duration-300 group overflow-hidden"
              >
                <CardHeader className="py-4 pb-0 relative">
                  <div className="absolute top-0 right-0 -mt-6 -mr-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <PersonIcon className="h-24 w-24 text-amber-500 rotate-12" />
                  </div>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <div className="bg-amber-100 dark:bg-amber-900 p-1 rounded-full">
                      <PersonIcon className="h-3.5 w-3.5 text-amber-500" />
                    </div>
                    Преподаватели
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3 pb-4">
                  <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
                    {stats.usersByRole?.teacher || 0}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center">
                    <MixerHorizontalIcon className="h-3 w-3 mr-1 text-amber-500" />
                    <span>Создатели обучающего контента</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* User Management Card */}
            <Card
              withSticky
              className="border border-border bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 shadow-md hover:shadow-lg transition-all duration-300 group overflow-hidden"
            >
              <CardHeader>
                <div className="absolute top-2 right-2 opacity-5 group-hover:opacity-10 transition-opacity">
                  <PersonIcon className="h-32 w-32 text-indigo-500 rotate-12" />
                </div>
                <CardTitle className="flex items-center group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  <div className="bg-indigo-100 p-2 rounded-full mr-2 dark:bg-indigo-900">
                    <PersonIcon className="h-5 w-5 text-indigo-500" />
                  </div>
                  Управление пользователями
                </CardTitle>
                <CardDescription>
                  Создание, редактирование и управление учетными записями
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-4">
                  <p className="text-sm">
                    Управляйте всеми учетными записями студентов, преподавателей
                    и администраторов.
                  </p>
                  <div className="flex items-center text-sm">
                    <ListBulletIcon className="h-4 w-4 mr-2 text-indigo-500" />
                    <span>Просмотр всех пользователей</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <MagnifyingGlassIcon className="h-4 w-4 mr-2 text-indigo-500" />
                    <span>Поиск и фильтрация</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gradient-to-r from-indigo-50/50 to-indigo-100/50 dark:from-indigo-950/50 dark:to-indigo-900/50 border-t border-indigo-100 dark:border-indigo-800/30">
                <Button
                  onClick={() => navigate("/admin/users")}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 group"
                >
                  <PersonIcon className="h-4 w-4 mr-2 group-hover:animate-pulse" />
                  Управление пользователями
                </Button>
              </CardFooter>
            </Card>

            {/* Quiz Management Card */}
            <Card
              withSticky
              className="border border-border bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950 dark:to-blue-950 shadow-md hover:shadow-lg transition-all duration-300 group overflow-hidden"
            >
              <CardHeader>
                <div className="absolute top-2 right-2 opacity-5 group-hover:opacity-10 transition-opacity">
                  <ReaderIcon className="h-32 w-32 text-blue-500 rotate-12" />
                </div>
                <CardTitle className="flex items-center group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  <div className="bg-blue-100 p-2 rounded-full mr-2 dark:bg-blue-900">
                    <ReaderIcon className="h-5 w-5 text-blue-500" />
                  </div>
                  Управление тестами
                </CardTitle>
                <CardDescription>
                  Управление всеми тестами в системе
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-4">
                  <p className="text-sm">
                    Просмотр, редактирование и назначение тестов студентам и
                    группам.
                  </p>
                  <div className="flex items-center text-sm">
                    <GearIcon className="h-4 w-4 mr-2 text-blue-500" />
                    <span>Редактирование тестов</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircledIcon className="h-4 w-4 mr-2 text-blue-500" />
                    <span>Управление публикацией</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gradient-to-r from-blue-50/50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/50 border-t border-blue-100 dark:border-blue-800/30">
                <Button
                  onClick={() => navigate("/admin/quizzes")}
                  className="w-full bg-blue-600 hover:bg-blue-700 group"
                >
                  <ReaderIcon className="h-4 w-4 mr-2 group-hover:animate-pulse" />
                  Управление тестами
                </Button>
              </CardFooter>
            </Card>

            {/* Analytics Card */}
            <Card
              withSticky
              className="border border-border bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 shadow-md hover:shadow-lg transition-all duration-300 group overflow-hidden"
            >
              <CardHeader>
                <div className="absolute top-2 right-2 opacity-5 group-hover:opacity-10 transition-opacity">
                  <BarChartIcon className="h-32 w-32 text-amber-500 rotate-12" />
                </div>
                <CardTitle className="flex items-center group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  <div className="bg-amber-100 p-2 rounded-full mr-2 dark:bg-amber-900">
                    <BarChartIcon className="h-5 w-5 text-amber-500" />
                  </div>
                  Аналитика
                </CardTitle>
                <CardDescription>Статистика и отчеты</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-4">
                  <p className="text-sm">
                    Просмотр аналитики и отчетов по успеваемости студентов и
                    эффективности тестов.
                  </p>
                  <div className="flex items-center text-sm">
                    <BarChartIcon className="h-4 w-4 mr-2 text-amber-500" />
                    <span>Статистика прохождения</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <DashboardIcon className="h-4 w-4 mr-2 text-amber-500" />
                    <span>Сводные отчеты</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gradient-to-r from-amber-50/50 to-amber-100/50 dark:from-amber-950/50 dark:to-amber-900/50 border-t border-amber-100 dark:border-amber-800/30">
                <Button
                  onClick={() => navigate("/admin/analytics")}
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
