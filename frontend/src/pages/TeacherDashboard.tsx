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
import {
  ReaderIcon,
  PersonIcon,
  CheckboxIcon,
  BarChartIcon,
} from "@radix-ui/react-icons";
import { Header } from "../components/layout/header";
import { authApi } from "../api/auth";
import { teacherApi } from "../api/quizApi";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [quizCount, setQuizCount] = useState(0);

  useEffect(() => {
    const fetchUserAndQuizzes = async () => {
      try {
        // First check if we have a token
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        // Fetch the authenticated user profile
        const user = await authApi.getProfile();

        if (user.role !== UserRole.TEACHER) {
          navigate("/not-authorized");
          return;
        }

        setCurrentUser(user);

        // Fetch teacher's quizzes
        const quizzes = await teacherApi.getMyQuizzes();
        setQuizCount(quizzes.length);
      } catch (error) {
        console.error("Error fetching data:", error);
        // Clear invalid tokens
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndQuizzes();
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
          <h1 className="text-3xl font-bold mb-2">Панель преподавателя</h1>
          <p className="text-muted-foreground mb-6">
            Управление тестами и группами студентов
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="border border-border">
              <CardHeader className="py-4">
                <CardTitle className="text-sm font-medium">Мои тесты</CardTitle>
              </CardHeader>
              <CardContent className="py-0 pb-4">
                <div className="text-3xl font-bold">{quizCount}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* My Quizzes Card */}
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ReaderIcon className="mr-2 h-5 w-5" />
                  Мои тесты
                </CardTitle>
                <CardDescription>Управление вашими тестами</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Создавайте, редактируйте и управляйте своими тестами для
                  студентов.
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => navigate("/teacher/quizzes")}
                  className="w-full"
                >
                  Управление тестами
                </Button>
              </CardFooter>
            </Card>

            {/* Student Groups Card */}
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PersonIcon className="mr-2 h-5 w-5" />
                  Группы студентов
                </CardTitle>
                <CardDescription>Управление группами студентов</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Создавайте и управляйте группами студентов для удобного
                  назначения тестов.
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => navigate("/teacher/groups")}
                  className="w-full"
                >
                  Управление группами
                </Button>
              </CardFooter>
            </Card>

            {/* Question Bank Card */}
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckboxIcon className="mr-2 h-5 w-5" />
                  Банк вопросов
                </CardTitle>
                <CardDescription>
                  Ваш банк вопросов для тестирования
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Создавайте и управляйте вопросами, которые можно использовать
                  повторно в разных тестах.
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => navigate("/teacher/questions")}
                  className="w-full"
                >
                  Управление вопросами
                </Button>
              </CardFooter>
            </Card>

            {/* Student Performance Card */}
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChartIcon className="mr-2 h-5 w-5" />
                  Успеваемость студентов
                </CardTitle>
                <CardDescription>
                  Аналитика результатов тестирования
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Просматривайте аналитику и отчеты по успеваемости ваших
                  студентов.
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => navigate("/teacher/analytics")}
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
