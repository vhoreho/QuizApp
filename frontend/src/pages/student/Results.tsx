import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, UserRole } from "../../lib/types";
import { Header } from "../../components/layout/header";
import { Button } from "../../components/ui/button";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
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
import api from "../../api/axiosConfig";

interface QuizResult {
  id: number;
  quizId: number;
  quizTitle: string;
  date: string;
  score: number;
  maxScore: number;
  timeSpent: string;
  category: string;
}

export default function StudentResults() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    fetchResults();
  }, [navigate]);

  const fetchResults = async () => {
    setIsLoading(true);
    try {
      // In a real application, this would fetch from your API
      // const response = await api.get("/student/results");
      // setResults(response.data);

      // Mock data for demonstration
      setResults([
        {
          id: 1,
          quizId: 1,
          quizTitle: "Основы JavaScript",
          date: "2023-10-15T14:30:00Z",
          score: 8,
          maxScore: 10,
          timeSpent: "12 мин",
          category: "JavaScript",
        },
        {
          id: 2,
          quizId: 3,
          quizTitle: "Основы HTML и CSS",
          date: "2023-10-16T11:45:00Z",
          score: 13,
          maxScore: 15,
          timeSpent: "20 мин",
          category: "Веб-разработка",
        },
        {
          id: 3,
          quizId: 2,
          quizTitle: "Алгоритмы и структуры данных",
          date: "2023-10-18T09:15:00Z",
          score: 5,
          maxScore: 8,
          timeSpent: "18 мин",
          category: "Алгоритмы",
        },
        {
          id: 4,
          quizId: 4,
          quizTitle: "React Основы",
          date: "2023-10-20T16:20:00Z",
          score: 10,
          maxScore: 12,
          timeSpent: "25 мин",
          category: "JavaScript",
        },
      ]);
    } catch (err) {
      console.error("Error fetching results:", err);
    } finally {
      setIsLoading(false);
    }
  };

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

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return "text-success";
    if (percentage >= 60) return "text-secondary";
    return "text-destructive";
  };

  const getScoreBadge = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) {
      return <Badge variant="success">Отлично</Badge>;
    } else if (percentage >= 60) {
      return <Badge>Хорошо</Badge>;
    } else if (percentage >= 40) {
      return <Badge variant="secondary">Удовлетворительно</Badge>;
    } else {
      return <Badge variant="destructive">Неудовлетворительно</Badge>;
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
            <Card className="border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl">{results.length}</CardTitle>
                <CardDescription>Всего пройдено тестов</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl text-success">
                  {results.length > 0
                    ? Math.round(
                        (results.reduce(
                          (sum, result) => sum + result.score,
                          0
                        ) /
                          results.reduce(
                            (sum, result) => sum + result.maxScore,
                            0
                          )) *
                          100
                      )
                    : 0}
                  %
                </CardTitle>
                <CardDescription>Средний результат</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl">
                  {results.length > 0
                    ? Math.max(
                        ...results.map(
                          (result) => (result.score / result.maxScore) * 100
                        )
                      )
                    : 0}
                  %
                </CardTitle>
                <CardDescription>Лучший результат</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <Card className="border border-border">
            <CardHeader>
              <CardTitle>История результатов</CardTitle>
              <CardDescription>
                Все пройденные вами тесты и результаты
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">Загрузка результатов...</div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Название теста</TableHead>
                        <TableHead>Категория</TableHead>
                        <TableHead>Дата</TableHead>
                        <TableHead>Время</TableHead>
                        <TableHead>Результат</TableHead>
                        <TableHead>Оценка</TableHead>
                        <TableHead className="text-right">Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((result) => (
                        <TableRow key={result.id}>
                          <TableCell className="font-medium">
                            {result.quizTitle}
                          </TableCell>
                          <TableCell>{result.category}</TableCell>
                          <TableCell>{formatDate(result.date)}</TableCell>
                          <TableCell>{result.timeSpent}</TableCell>
                          <TableCell
                            className={getScoreColor(
                              result.score,
                              result.maxScore
                            )}
                          >
                            {result.score} / {result.maxScore}
                          </TableCell>
                          <TableCell>
                            {getScoreBadge(result.score, result.maxScore)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                navigate(`/results/${result.quizId}`)
                              }
                            >
                              Подробнее
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {results.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center">
                            Вы еще не прошли ни одного теста
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
