import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, UserRole } from "../../lib/types";
import { PageLayout } from "../../components/layout/PageLayout";
import { Button } from "../../components/ui/button";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { adminApi } from "../../api/quizApi";
import { authApi } from "../../api/auth";
import { toast } from "../../components/ui/use-toast";

interface DashboardStats {
  userCount: number;
  quizCount: number;
  completionCount: number;
  averageScore: number;
}

export default function Analytics() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [stats, setStats] = useState<any>({
    totalUsers: 0,
    newUsers: 0,
    activeUsers: 0,
    quizzes: 0,
    completions: 0,
    averageScore: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const user = await authApi.getProfile();
        if (user.role !== UserRole.ADMIN) {
          navigate("/not-authorized");
          return;
        }

        setCurrentUser(user);
        await fetchStats();
      } catch (error) {
        console.error("Error fetching user:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }
    };

    fetchUserAndData();
  }, [navigate]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const dashboardStats = await adminApi.getDashboardStats();
      setStats(dashboardStats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить статистику",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-primary border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка статистики...</p>
        </div>
      </div>
    );
  }

  return (
    <PageLayout>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin/dashboard")}
            className="mr-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Аналитика</h1>
        </div>
      </div>

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              className="flex items-center text-muted-foreground mr-4"
              onClick={() => navigate("/admin/dashboard")}
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Назад
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Аналитика</h1>
              <p className="text-muted-foreground">
                Просмотр статистики использования системы
              </p>
            </div>
          </div>

          {/* Основные показатели */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bold">
                  {stats?.userCount || 0}
                </CardTitle>
                <CardDescription>Всего пользователей</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  <span className="text-success">+12%</span> с прошлого месяца
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bold">
                  {stats?.quizCount || 0}
                </CardTitle>
                <CardDescription>Всего тестов</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  <span className="text-success">+5%</span> с прошлого месяца
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bold">
                  {stats?.completionCount || 0}
                </CardTitle>
                <CardDescription>Прохождений тестов</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  <span className="text-success">+18%</span> с прошлого месяца
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bold">
                  {stats?.averageScore
                    ? `${stats.averageScore.toFixed(1)}%`
                    : "0%"}
                </CardTitle>
                <CardDescription>Средний результат</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  <span className="text-success">+2.5%</span> с прошлого месяца
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Графики активности и дополнительная информация */}
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Активность пользователей</CardTitle>
                <CardDescription>
                  График активности за последние 30 дней
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center border-2 border-dashed border-muted rounded-md">
                  <p className="text-muted-foreground text-sm">
                    График активности находится в разработке
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Успешность прохождения</CardTitle>
                <CardDescription>
                  Распределение результатов по категориям
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center border-2 border-dashed border-muted rounded-md">
                  <p className="text-muted-foreground text-sm">
                    График успешности находится в разработке
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Рейтинги и лучшие студенты */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Популярные тесты</CardTitle>
                <CardDescription>
                  Тесты с наибольшим количеством прохождений
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-60 flex items-center justify-center border-2 border-dashed border-muted rounded-md">
                  <p className="text-muted-foreground text-sm">
                    Список популярных тестов находится в разработке
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Лучшие студенты</CardTitle>
                <CardDescription>
                  Студенты с наивысшими результатами
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-60 flex items-center justify-center border-2 border-dashed border-muted rounded-md">
                  <p className="text-muted-foreground text-sm">
                    Рейтинг студентов находится в разработке
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </PageLayout>
  );
}
