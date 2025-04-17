import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, UserRole, Quiz as QuizType } from "../../lib/types";
import { Header } from "../../components/layout/header";
import { Button } from "../../components/ui/button";
import { ArrowLeftIcon, PlusIcon } from "@radix-ui/react-icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { teacherApi } from "../../api/quizApi";
import { authApi } from "../../api/auth";
import { toast } from "../../components/ui/use-toast";

export default function TeacherQuizManagement() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [quizzes, setQuizzes] = useState<QuizType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndQuizzes = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const user = await authApi.getProfile();
        if (user.role !== UserRole.TEACHER) {
          navigate("/not-authorized");
          return;
        }

        setCurrentUser(user);
        await fetchQuizzes();
      } catch (error) {
        console.error("Error fetching user:", error);
        navigate("/login");
      }
    };

    fetchUserAndQuizzes();
  }, [navigate]);

  const fetchQuizzes = async () => {
    setIsLoading(true);
    try {
      const fetchedQuizzes = await teacherApi.getMyQuizzes();
      setQuizzes(fetchedQuizzes);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description:
          "Не удалось загрузить тесты. Пожалуйста, попробуйте позже.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId: number) => {
    if (window.confirm("Вы уверены, что хотите удалить этот тест?")) {
      try {
        await teacherApi.deleteQuiz(quizId);
        toast({
          title: "Успешно",
          description: "Тест был удален",
        });
        fetchQuizzes();
      } catch (error) {
        console.error("Error deleting quiz:", error);
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Не удалось удалить тест",
        });
      }
    }
  };

  const handleLogout = async () => {
    await authApi.logout();
    setCurrentUser(null);
    navigate("/login");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
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
      <Header user={currentUser!} onLogout={handleLogout} />

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

          <Card className="border border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Мои тесты</CardTitle>
                <CardDescription>Все тесты, созданные вами</CardDescription>
              </div>
              <Button
                className="flex items-center"
                onClick={() => navigate("/create")}
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                Создать тест
              </Button>
            </CardHeader>
            <CardContent>
              {quizzes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    У вас пока нет созданных тестов
                  </p>
                  <Button onClick={() => navigate("/create")}>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Создать первый тест
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Название</TableHead>
                        <TableHead>Описание</TableHead>
                        <TableHead>Дата создания</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead className="text-right">Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quizzes.map((quiz) => (
                        <TableRow key={quiz.id}>
                          <TableCell className="font-medium">
                            {quiz.title}
                          </TableCell>
                          <TableCell>{quiz.description}</TableCell>
                          <TableCell>{formatDate(quiz.createdAt)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                quiz.isPublished ? "success" : "secondary"
                              }
                            >
                              {quiz.isPublished ? "Опубликован" : "Черновик"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              className="mr-2"
                              onClick={() => navigate(`/quiz/${quiz.id}`)}
                            >
                              Просмотр
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mr-2"
                              onClick={() => navigate(`/results/${quiz.id}`)}
                            >
                              Результаты
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteQuiz(quiz.id)}
                            >
                              Удалить
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
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
