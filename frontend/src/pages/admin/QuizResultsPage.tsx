import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { UserRole } from "@/lib/types";
import { useRequireRole, useLogout } from "@/hooks/queries/useAuth";
import {
  useAdminQuizById,
  useAdminQuizResults,
  useAdminQuizStatistics,
  useTeacherQuizById,
  useTeacherQuizResults,
  useTeacherQuizStatistics,
} from "@/hooks/queries/useQuizzes";

export default function AdminQuizResultsPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();

  // Проверяем роль пользователя и получаем его профиль
  const { user, isLoading: isUserLoading } = useRequireRole([
    UserRole.ADMIN,
    UserRole.TEACHER,
  ]);
  const logoutMutation = useLogout();

  // Определяем, какие хуки использовать в зависимости от роли пользователя
  const isAdmin = user?.role === UserRole.ADMIN;
  const returnPath = isAdmin ? "/admin/quizzes" : "/teacher/quizzes";

  // Хуки для получения данных в зависимости от роли
  const { data: quiz, isLoading: isQuizLoading } = isAdmin
    ? useAdminQuizById(Number(quizId))
    : useTeacherQuizById(Number(quizId));

  const { data: results, isLoading: areResultsLoading } = isAdmin
    ? useAdminQuizResults(Number(quizId))
    : useTeacherQuizResults(Number(quizId));

  const { data: stats, isLoading: areStatsLoading } = isAdmin
    ? useAdminQuizStatistics(Number(quizId))
    : useTeacherQuizStatistics(Number(quizId));

  const isLoading =
    isUserLoading || isQuizLoading || areResultsLoading || areStatsLoading;

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
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
      return <Badge variant="success">Отлично</Badge>;
    } else if (score >= 6) {
      return <Badge>Хорошо</Badge>;
    } else if (score >= 4) {
      return <Badge variant="secondary">Удовлетворительно</Badge>;
    } else {
      return <Badge variant="destructive">Неудовлетворительно</Badge>;
    }
  };

  const prepareChartData = () => {
    if (!stats || !stats.distribution) return [];

    return [
      { name: "0-2", value: stats.distribution["0-2"] },
      { name: "2.1-4", value: stats.distribution["2.1-4"] },
      { name: "4.1-6", value: stats.distribution["4.1-6"] },
      { name: "6.1-8", value: stats.distribution["6.1-8"] },
      { name: "8.1-10", value: stats.distribution["8.1-10"] },
    ];
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

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive text-xl mb-4">Тест не найден</p>
          <Button onClick={() => navigate(returnPath)}>
            Вернуться к списку тестов
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header user={user!} onLogout={handleLogout} />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              className="flex items-center text-muted-foreground mr-4"
              onClick={() => navigate(returnPath)}
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Назад
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{quiz.title}</h1>
              <p className="text-muted-foreground">{quiz.description}</p>
            </div>
          </div>

          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card className="border border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl">
                    {stats.totalParticipants}
                  </CardTitle>
                  <CardDescription>Всего участников</CardDescription>
                </CardHeader>
              </Card>

              <Card className="border border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl text-success">
                    {stats.averageScore.toFixed(1)}
                  </CardTitle>
                  <CardDescription>Средний балл</CardDescription>
                </CardHeader>
              </Card>

              <Card className="border border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl">
                    {stats.passRate.toFixed(1)}%
                  </CardTitle>
                  <CardDescription>Процент успешных сдач</CardDescription>
                </CardHeader>
              </Card>

              <Card className="border border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl">
                    {stats.highestScore.toFixed(1)}
                  </CardTitle>
                  <CardDescription>Наивысший балл</CardDescription>
                </CardHeader>
              </Card>
            </div>
          )}

          {stats && stats.distribution && (
            <Card className="border border-border mb-6">
              <CardHeader>
                <CardTitle>Распределение оценок</CardTitle>
                <CardDescription>
                  Количество студентов в каждом диапазоне баллов
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={prepareChartData()}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="value"
                        name="Количество студентов"
                        fill="#8884d8"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border border-border">
            <CardHeader>
              <CardTitle>Список результатов</CardTitle>
              <CardDescription>
                Результаты студентов, прошедших тест
              </CardDescription>
            </CardHeader>
            <CardContent>
              {results && results.length > 0 ? (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Студент</TableHead>
                        <TableHead>Дата</TableHead>
                        <TableHead>Балл</TableHead>
                        <TableHead>Правильных ответов</TableHead>
                        <TableHead>Статус</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((result) => (
                        <TableRow key={result.id}>
                          <TableCell className="font-medium">
                            {result.user?.username || "Неизвестно"}
                          </TableCell>
                          <TableCell>{formatDate(result.createdAt)}</TableCell>
                          <TableCell>
                            <span className={getScoreColor(result.score)}>
                              {result.score.toFixed(1)}
                            </span>
                          </TableCell>
                          <TableCell>
                            {result.correctAnswers} / {result.totalQuestions}
                          </TableCell>
                          <TableCell>{getScoreBadge(result.score)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Пока никто не прошел этот тест
                  </p>
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
