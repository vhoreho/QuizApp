import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, UserRole } from "../lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PersonIcon, ReaderIcon, BarChartIcon } from "@radix-ui/react-icons";
import { Header } from "../components/layout/header";
import { authApi } from "../api/auth";
import { adminApi } from "../api/quizApi";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchUserAndStats = async () => {
      try {
        // Fetch the authenticated user profile
        const user = await authApi.getProfile();

        if (user.role !== UserRole.ADMIN) {
          navigate("/not-authorized");
          return;
        }

        setCurrentUser(user);

        // Fetch dashboard statistics
        const dashboardStats = await adminApi.getDashboardStats();
        setStats(dashboardStats);
      } catch (error) {
        console.error("Error fetching data:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndStats();
  }, [navigate]);

  const handleLogout = async () => {
    await authApi.logout();
    setCurrentUser(null);
    navigate("/login");
  };

  if (loading) {
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
      <Header user={currentUser!} onLogout={handleLogout} />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">Панель администратора</h1>
          <p className="text-muted-foreground mb-6">
            Управление всей системой тестирования
          </p>

          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card className="border border-border">
                <CardHeader className="py-4">
                  <CardTitle className="text-sm font-medium">
                    Пользователи
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.userCount}</div>
                </CardContent>
              </Card>

              <Card className="border border-border">
                <CardHeader className="py-4">
                  <CardTitle className="text-sm font-medium">Тесты</CardTitle>
                </CardHeader>
                <CardContent className="py-0">
                  <div className="text-3xl font-bold">{stats.quizCount}</div>
                </CardContent>
              </Card>

              <Card className="border border-border">
                <CardHeader className="py-4">
                  <CardTitle className="text-sm font-medium">
                    Результаты
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-0">
                  <div className="text-3xl font-bold">{stats.resultCount}</div>
                </CardContent>
              </Card>

              <Card className="border border-border">
                <CardHeader className="py-4">
                  <CardTitle className="text-sm font-medium">
                    Преподаватели
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-0">
                  <div className="text-3xl font-bold">
                    {stats.usersByRole?.teacher || 0}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* User Management Card */}
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PersonIcon className="mr-2 h-5 w-5" />
                  Управление пользователями
                </CardTitle>
                <CardDescription>
                  Создание, редактирование и управление учетными записями
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Управляйте всеми учетными записями студентов, преподавателей и
                  администраторов.
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => navigate("/admin/users")}
                  className="w-full"
                >
                  Управление пользователями
                </Button>
              </CardFooter>
            </Card>

            {/* Quiz Management Card */}
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ReaderIcon className="mr-2 h-5 w-5" />
                  Управление тестами
                </CardTitle>
                <CardDescription>
                  Управление всеми тестами в системе
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Просмотр, редактирование и назначение тестов студентам и
                  группам.
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => navigate("/admin/quizzes")}
                  className="w-full"
                >
                  Управление тестами
                </Button>
              </CardFooter>
            </Card>

            {/* Analytics Card */}
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChartIcon className="mr-2 h-5 w-5" />
                  Аналитика
                </CardTitle>
                <CardDescription>Статистика и отчеты</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Просмотр аналитики и отчетов по успеваемости студентов и
                  эффективности тестов.
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => navigate("/admin/analytics")}
                  className="w-full"
                >
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
