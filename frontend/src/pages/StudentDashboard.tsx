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
import { ReaderIcon, CheckIcon, BarChartIcon } from "@radix-ui/react-icons";
import { Header } from "../components/layout/header";
import { authApi } from "../api/auth";
import { studentApi } from "../api/quizApi";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [performance, setPerformance] = useState<any>(null);

  useEffect(() => {
    const fetchUserAndPerformance = async () => {
      try {
        // Fetch the authenticated user profile
        const user = await authApi.getProfile();

        if (user.role !== UserRole.STUDENT) {
          navigate("/not-authorized");
          return;
        }

        setCurrentUser(user);

        // Fetch student performance data
        const dashboardData = await studentApi.getStudentDashboard();
        setPerformance(dashboardData);
      } catch (error) {
        console.error("Error fetching data:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndPerformance();
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
          <h1 className="text-3xl font-bold mb-2">Панель студента</h1>
          <p className="text-muted-foreground mb-6">
            Прохождение тестов и отслеживание прогресса
          </p>

          {performance && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card className="border border-border">
                <CardHeader className="py-4">
                  <CardTitle className="text-sm font-medium">
                    Пройдено тестов
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-0 pb-4">
                  <div className="text-3xl font-bold">
                    {performance.totalQuizzes}
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-border">
                <CardHeader className="py-4">
                  <CardTitle className="text-sm font-medium">
                    Средний балл
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-0 pb-4">
                  <div className="text-3xl font-bold">
                    {performance.averageScore
                      ? performance.averageScore.toFixed(1)
                      : 0}
                    %
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-border">
                <CardHeader className="py-4">
                  <CardTitle className="text-sm font-medium">Сдано</CardTitle>
                </CardHeader>
                <CardContent className="py-0 pb-4">
                  <div className="text-3xl font-bold">
                    {performance.quizzesPassed}
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-border">
                <CardHeader className="py-4">
                  <CardTitle className="text-sm font-medium">
                    Лучший результат
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-0 pb-4">
                  <div className="text-3xl font-bold">
                    {performance.highestScore
                      ? performance.highestScore.toFixed(1)
                      : 0}
                    %
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Assigned Quizzes Card */}
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ReaderIcon className="mr-2 h-5 w-5" />
                  Мои тесты
                </CardTitle>
                <CardDescription>Назначенные вам тесты</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Просматривайте и проходите тесты, назначенные вам
                  преподавателями.
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => navigate("/student/quizzes")}
                  className="w-full"
                >
                  Просмотр тестов
                </Button>
              </CardFooter>
            </Card>

            {/* Results Card */}
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckIcon className="mr-2 h-5 w-5" />
                  Мои результаты
                </CardTitle>
                <CardDescription>Результаты пройденных тестов</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Просматривайте результаты и отзывы по пройденным тестам.
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => navigate("/student/results")}
                  className="w-full"
                >
                  Просмотр результатов
                </Button>
              </CardFooter>
            </Card>

            {/* Progress Card */}
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChartIcon className="mr-2 h-5 w-5" />
                  Мой прогресс
                </CardTitle>
                <CardDescription>Отслеживание вашего прогресса</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Отслеживайте свой прогресс и улучшение результатов с течением
                  времени.
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => navigate("/student/progress")}
                  className="w-full"
                >
                  Просмотр прогресса
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
