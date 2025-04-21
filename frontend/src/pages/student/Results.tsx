import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, UserRole, Result, Quiz } from "../../lib/types";
import { Header } from "../../components/layout/header";
import { Button } from "../../components/ui/button";
import {
  ArrowLeftIcon,
  BookmarkIcon,
  BarChartIcon,
  StarIcon,
  MagnifyingGlassIcon,
  CheckCircledIcon,
  Cross2Icon,
} from "@radix-ui/react-icons";
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
import { toast } from "@/components/ui/use-toast";
import { useStudentResults } from "@/hooks/queries/useQuizzes";

interface DisplayResult {
  id: number;
  quizId: number;
  quizTitle: string;
  date: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  category?: string;
}

// Using the original Result interface without modification
// The 'quiz' property is already optional in the Result interface

export default function StudentResults() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { data: apiResults, isLoading, error: apiError } = useStudentResults();
  const [displayResults, setDisplayResults] = useState<DisplayResult[]>([]);

  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (!userJson) {
      navigate("/login");
      return;
    }

    const user = JSON.parse(userJson) as User;
    if (user.role !== UserRole.STUDENT) {
      navigate("/login");
      return;
    }

    setCurrentUser(user);
  }, [navigate]);

  // Обработка результатов API для отображения
  useEffect(() => {
    if (apiResults) {
      const formattedResults = apiResults.map((result: Result) => ({
        id: result.id,
        quizId: result.quizId,
        quizTitle: result.quiz?.title || "Неизвестный тест",
        date: result.createdAt,
        score: result.score,
        correctAnswers: result.correctAnswers,
        totalQuestions: result.totalQuestions,
      }));
      setDisplayResults(formattedResults);
    } else {
      setDisplayResults([]);
    }
  }, [apiResults]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    navigate("/login");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-success";
    if (score >= 6) return "text-secondary";
    return "text-destructive";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 8) {
      return (
        <Badge
          variant="success"
          className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 font-medium"
        >
          Отлично
        </Badge>
      );
    } else if (score >= 6) {
      return (
        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 font-medium">
          Хорошо
        </Badge>
      );
    } else if (score >= 4) {
      return (
        <Badge
          variant="secondary"
          className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 font-medium"
        >
          Удовлетворительно
        </Badge>
      );
    } else {
      return (
        <Badge
          variant="destructive"
          className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 font-medium"
        >
          Неудовлетворительно
        </Badge>
      );
    }
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header user={currentUser} onLogout={handleLogout} />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              className="flex items-center text-muted-foreground mr-4"
              onClick={() => navigate("/student/dashboard")}
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Назад
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Мои результаты</h1>
              <p className="text-muted-foreground">
                История пройденных тестов и полученные результаты
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="border border-border bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 shadow-md transition-all duration-300 hover:shadow-lg group relative overflow-hidden">
              <div className="absolute top-2 right-2 opacity-10 text-primary group-hover:scale-110 transition-transform">
                <BookmarkIcon className="h-16 w-16" />
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <BookmarkIcon className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="text-2xl animate-pulse-subtle">
                    {displayResults.length}
                  </CardTitle>
                </div>
                <CardDescription className="text-sm">
                  Всего пройдено тестов
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border border-border bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 shadow-md transition-all duration-300 hover:shadow-lg group relative overflow-hidden">
              <div className="absolute top-2 right-2 opacity-10 text-blue-500 group-hover:scale-110 transition-transform">
                <BarChartIcon className="h-16 w-16" />
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                    <BarChartIcon className="h-4 w-4 text-blue-500" />
                  </div>
                  <CardTitle className="text-lg">
                    {displayResults.length > 0 ? (
                      <div className="flex items-center">
                        {getScoreBadge(
                          displayResults.reduce(
                            (sum, result) => sum + result.score,
                            0
                          ) / displayResults.length
                        )}
                        <span className="ml-2 text-sm">
                          (
                          {(
                            displayResults.reduce(
                              (sum, result) => sum + result.score,
                              0
                            ) / displayResults.length
                          ).toFixed(1)}
                          )
                        </span>
                      </div>
                    ) : (
                      "Нет данных"
                    )}
                  </CardTitle>
                </div>
                <CardDescription className="text-sm">
                  Средняя оценка
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border border-border bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 shadow-md transition-all duration-300 hover:shadow-lg group relative overflow-hidden">
              <div className="absolute top-2 right-2 opacity-10 text-amber-500 group-hover:scale-110 transition-transform">
                <StarIcon className="h-16 w-16" />
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="bg-amber-100 dark:bg-amber-900 p-2 rounded-full">
                    <StarIcon className="h-4 w-4 text-amber-500" />
                  </div>
                  <CardTitle className="text-lg">
                    {displayResults.length > 0 ? (
                      <div className="flex items-center">
                        {getScoreBadge(
                          Math.max(
                            ...displayResults.map((result) => result.score)
                          )
                        )}
                        <span className="ml-2 text-sm">
                          (
                          {Math.max(
                            ...displayResults.map((result) => result.score)
                          ).toFixed(1)}
                          )
                        </span>
                      </div>
                    ) : (
                      "Нет данных"
                    )}
                  </CardTitle>
                </div>
                <CardDescription className="text-sm">
                  Лучшая оценка
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <Card className="border border-border shadow-md hover:shadow-lg transition-all duration-300">
            <CardHeader className="border-b bg-muted/30">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MagnifyingGlassIcon className="h-5 w-5 text-primary" />
                    История результатов
                  </CardTitle>
                  <CardDescription>
                    Все пройденные вами тесты и результаты
                  </CardDescription>
                </div>
                {displayResults.length > 0 && (
                  <Badge
                    variant="outline"
                    className="bg-primary/5 text-primary"
                  >
                    {displayResults.length}{" "}
                    {displayResults.length === 1
                      ? "запись"
                      : displayResults.length < 5
                      ? "записи"
                      : "записей"}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="text-center py-8 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-muted-foreground">
                    Загрузка результатов...
                  </p>
                </div>
              ) : (
                <div>
                  <Table>
                    <TableHeader className="bg-muted/20">
                      <TableRow>
                        <TableHead className="font-semibold">
                          Название теста
                        </TableHead>
                        <TableHead className="font-semibold">
                          Категория
                        </TableHead>
                        <TableHead className="font-semibold">Дата</TableHead>
                        <TableHead className="font-semibold">
                          Результат
                        </TableHead>
                        <TableHead className="font-semibold">Оценка</TableHead>
                        <TableHead className="text-right font-semibold">
                          Действия
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {displayResults.map((result) => (
                        <TableRow
                          key={result.id}
                          className="group hover:bg-muted/40 transition-colors"
                        >
                          <TableCell className="font-medium text-primary">
                            {result.quizTitle}
                          </TableCell>
                          <TableCell>
                            {result.category ? (
                              <Badge variant="outline" className="font-normal">
                                {result.category}
                              </Badge>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(result.date)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <span className="font-medium">
                                {result.correctAnswers}
                              </span>
                              <span className="mx-1 text-muted-foreground">
                                /
                              </span>
                              <span>{result.totalQuestions}</span>
                              <span className="ml-1 text-xs text-muted-foreground">
                                (
                                {Math.round(
                                  (result.correctAnswers /
                                    result.totalQuestions) *
                                    100
                                )}
                                %)
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{getScoreBadge(result.score)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              className="group-hover:bg-primary/10 transition-colors"
                              onClick={() =>
                                navigate(`/results/${result.quizId}`)
                              }
                            >
                              Подробнее
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {displayResults.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6}>
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                              <div className="bg-muted/30 p-3 rounded-full mb-4">
                                <Cross2Icon className="h-10 w-10 text-muted-foreground/50" />
                              </div>
                              <p className="text-lg font-medium mb-1">
                                Тесты еще не пройдены
                              </p>
                              <p className="text-muted-foreground max-w-md">
                                Вы пока не прошли ни одного теста. Перейдите в
                                раздел доступных тестов, чтобы начать свое
                                обучение.
                              </p>
                              <Button
                                onClick={() => navigate("/student/quizzes")}
                                className="mt-4"
                              >
                                Перейти к тестам
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
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
