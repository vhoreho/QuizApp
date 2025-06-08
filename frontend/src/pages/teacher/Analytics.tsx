import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserRole, User, Quiz } from "@/lib/types";
import { Header } from "../../components/layout/header";
import { Button } from "../../components/ui/button";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { authApi } from "../../api/auth";
import { teacherApi } from "../../api/quizApi";
import { toast } from "../../components/ui/use-toast";
import { isValidUser } from "@/lib/utils";

interface QuizAnalytics {
  id: number;
  title: string;
  totalParticipants: number;
  averageScore: number;
  passRate: number;
  highestScore: number;
  lowestScore: number;
}

interface QuizStatistics {
  totalParticipants: number;
  averageScore: number;
  passRate: number;
  highestScore: number;
  lowestScore: number;
  distribution: {
    "0-20": number;
    "21-40": number;
    "41-60": number;
    "61-80": number;
    "81-100": number;
  };
}

export default function TeacherAnalytics() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizAnalytics, setQuizAnalytics] = useState<
    Map<number, QuizStatistics>
  >(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);

  useEffect(() => {
    const fetchUserAndData = async () => {
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
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }
    };

    fetchUserAndData();
  }, [navigate]);

  const fetchQuizzes = async () => {
    setIsLoading(true);
    try {
      const fetchedQuizzes = await teacherApi.getMyQuizzes();
      setQuizzes(fetchedQuizzes);

      if (fetchedQuizzes.length > 0) {
        // Fetch statistics for all quizzes
        const statsMap = new Map<number, QuizStatistics>();

        await Promise.all(
          fetchedQuizzes.map(async (quiz) => {
            try {
              const stats = await teacherApi.getQuizStatistics(quiz.id);
              statsMap.set(quiz.id, stats);
            } catch (error) {
              console.error(
                `Error fetching statistics for quiz ${quiz.id}:`,
                error
              );
            }
          })
        );

        setQuizAnalytics(statsMap);

        if (fetchedQuizzes.length > 0) {
          setSelectedQuizId(fetchedQuizzes[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить данные аналитики",
      });
    } finally {
      setIsLoading(false);
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

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    if (score >= 40) return "text-orange-500";
    return "text-red-500";
  };

  const getSelectedQuizStats = () => {
    if (!selectedQuizId) return null;
    return quizAnalytics.get(selectedQuizId) || null;
  };

  const calculateOverallStats = () => {
    if (quizAnalytics.size === 0) {
      return {
        totalQuizzes: quizzes.length,
        totalParticipants: 0,
        averageScoreAcrossQuizzes: 0,
        averagePassRate: 0,
      };
    }

    let totalParticipants = 0;
    let totalScores = 0;
    let totalPassRates = 0;

    quizAnalytics.forEach((stats) => {
      totalParticipants += stats.totalParticipants;
      totalScores += stats.averageScore * stats.totalParticipants;
      totalPassRates += stats.passRate;
    });

    const averageScore =
      totalParticipants > 0 ? totalScores / totalParticipants : 0;

    const averagePassRate =
      quizAnalytics.size > 0 ? totalPassRates / quizAnalytics.size : 0;

    return {
      totalQuizzes: quizzes.length,
      totalParticipants,
      averageScoreAcrossQuizzes: averageScore,
      averagePassRate,
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-primary border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка данных аналитики...</p>
        </div>
      </div>
    );
  }

  const overallStats = calculateOverallStats();
  const selectedStats = getSelectedQuizStats();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header
        user={isValidUser(currentUser) ? currentUser : null}
        onLogout={handleLogout}
      />

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
              <h1 className="text-3xl font-bold">Аналитика</h1>
              <p className="text-muted-foreground">
                Статистика и аналитика по тестам
              </p>
            </div>
          </div>

          {quizzes.length === 0 ? (
            <Card className="border border-border">
              <CardHeader>
                <CardTitle>Аналитика недоступна</CardTitle>
                <CardDescription>
                  У вас пока нет созданных тестов
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Создайте тесты, чтобы получить аналитику по результатам
                </p>
                <Button onClick={() => navigate("/create")}>
                  Создать тест
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Overall Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card className="border border-border">
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-medium">
                      Всего тестов
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-0">
                    <div className="text-3xl font-bold">
                      {overallStats.totalQuizzes}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-border">
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-medium">
                      Всего участников
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-0">
                    <div className="text-3xl font-bold">
                      {overallStats.totalParticipants}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-border">
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-medium">
                      Средний балл
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-0">
                    <div
                      className={`text-3xl font-bold ${getScoreColor(
                        overallStats.averageScoreAcrossQuizzes
                      )}`}
                    >
                      {overallStats.averageScoreAcrossQuizzes.toFixed(1)}%
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-border">
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-medium">
                      Средний % прохождения
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-0">
                    <div className="text-3xl font-bold">
                      {overallStats.averagePassRate.toFixed(1)}%
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quiz Selector */}
              <Card className="border border-border mb-8">
                <CardHeader>
                  <CardTitle>Выберите тест для детальной аналитики</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {quizzes.map((quiz) => (
                      <Button
                        key={quiz.id}
                        variant={
                          selectedQuizId === quiz.id ? "default" : "outline"
                        }
                        onClick={() => setSelectedQuizId(quiz.id)}
                        className="justify-start overflow-hidden text-ellipsis whitespace-nowrap"
                      >
                        {quiz.title}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Selected Quiz Stats */}
              {selectedStats ? (
                <Card className="border border-border mb-8">
                  <CardHeader>
                    <CardTitle>
                      {quizzes.find((q) => q.id === selectedQuizId)?.title ||
                        "Детальная статистика"}
                    </CardTitle>
                    <CardDescription>
                      Детальная аналитика по выбранному тесту
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                      <div className="bg-background p-4 rounded-lg border">
                        <div className="text-sm font-medium text-muted-foreground mb-1">
                          Всего участников
                        </div>
                        <div className="text-2xl font-bold">
                          {selectedStats.totalParticipants}
                        </div>
                      </div>

                      <div className="bg-background p-4 rounded-lg border">
                        <div className="text-sm font-medium text-muted-foreground mb-1">
                          Средний балл
                        </div>
                        <div
                          className={`text-2xl font-bold ${getScoreColor(
                            selectedStats.averageScore
                          )}`}
                        >
                          {selectedStats.averageScore.toFixed(1)}%
                        </div>
                      </div>

                      <div className="bg-background p-4 rounded-lg border">
                        <div className="text-sm font-medium text-muted-foreground mb-1">
                          % прохождения
                        </div>
                        <div className="text-2xl font-bold">
                          {selectedStats.passRate.toFixed(1)}%
                        </div>
                      </div>

                      <div className="bg-background p-4 rounded-lg border">
                        <div className="text-sm font-medium text-muted-foreground mb-1">
                          Лучший результат
                        </div>
                        <div className="text-2xl font-bold text-green-500">
                          {selectedStats.highestScore.toFixed(1)}%
                        </div>
                      </div>

                      <div className="bg-background p-4 rounded-lg border">
                        <div className="text-sm font-medium text-muted-foreground mb-1">
                          Худший результат
                        </div>
                        <div className="text-2xl font-bold text-red-500">
                          {selectedStats.lowestScore.toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    {/* Score Distribution */}
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold mb-4">
                        Распределение баллов
                      </h3>
                      <div className="grid grid-cols-5 gap-2">
                        <div className="flex flex-col items-center">
                          <div className="h-32 w-full bg-gray-100 rounded-md relative flex items-end">
                            <div
                              className="bg-red-400 w-full rounded-b-md"
                              style={{
                                height: `${Math.min(
                                  100,
                                  (selectedStats.distribution["0-20"] * 100) /
                                    Math.max(1, selectedStats.totalParticipants)
                                )}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-xs mt-1">0-20%</span>
                          <span className="text-xs font-medium">
                            {selectedStats.distribution["0-20"]}
                          </span>
                        </div>

                        <div className="flex flex-col items-center">
                          <div className="h-32 w-full bg-gray-100 rounded-md relative flex items-end">
                            <div
                              className="bg-orange-400 w-full rounded-b-md"
                              style={{
                                height: `${Math.min(
                                  100,
                                  (selectedStats.distribution["21-40"] * 100) /
                                    Math.max(1, selectedStats.totalParticipants)
                                )}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-xs mt-1">21-40%</span>
                          <span className="text-xs font-medium">
                            {selectedStats.distribution["21-40"]}
                          </span>
                        </div>

                        <div className="flex flex-col items-center">
                          <div className="h-32 w-full bg-gray-100 rounded-md relative flex items-end">
                            <div
                              className="bg-yellow-400 w-full rounded-b-md"
                              style={{
                                height: `${Math.min(
                                  100,
                                  (selectedStats.distribution["41-60"] * 100) /
                                    Math.max(1, selectedStats.totalParticipants)
                                )}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-xs mt-1">41-60%</span>
                          <span className="text-xs font-medium">
                            {selectedStats.distribution["41-60"]}
                          </span>
                        </div>

                        <div className="flex flex-col items-center">
                          <div className="h-32 w-full bg-gray-100 rounded-md relative flex items-end">
                            <div
                              className="bg-green-400 w-full rounded-b-md"
                              style={{
                                height: `${Math.min(
                                  100,
                                  (selectedStats.distribution["61-80"] * 100) /
                                    Math.max(1, selectedStats.totalParticipants)
                                )}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-xs mt-1">61-80%</span>
                          <span className="text-xs font-medium">
                            {selectedStats.distribution["61-80"]}
                          </span>
                        </div>

                        <div className="flex flex-col items-center">
                          <div className="h-32 w-full bg-gray-100 rounded-md relative flex items-end">
                            <div
                              className="bg-green-600 w-full rounded-b-md"
                              style={{
                                height: `${Math.min(
                                  100,
                                  (selectedStats.distribution["81-100"] * 100) /
                                    Math.max(1, selectedStats.totalParticipants)
                                )}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-xs mt-1">81-100%</span>
                          <span className="text-xs font-medium">
                            {selectedStats.distribution["81-100"]}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8">
                      <Button
                        onClick={() => navigate(`/results/${selectedQuizId}`)}
                      >
                        Просмотреть все результаты
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border border-border mb-8">
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">
                      Выберите тест для просмотра детальной статистики
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
