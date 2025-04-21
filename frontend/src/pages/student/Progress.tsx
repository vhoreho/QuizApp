import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserRole } from "../../lib/types";
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
import { Badge } from "../../components/ui/badge";
import { toast } from "../../components/ui/use-toast";
import api from "../../api/axiosConfig";

// Типы данных
interface CategoryStats {
  category: string;
  quizzesTaken: number;
  averageScore: number;
  totalQuizzes: number;
}

interface RecentResult {
  id: number;
  quizTitle: string;
  score: number;
  maxScore: number;
  date: string;
}

interface ProgressData {
  completedQuizzes: number;
  averageScore: number;
  categoryStats: CategoryStats[];
  recentResults: RecentResult[];
}

export default function StudentProgress() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [progressData, setProgressData] = useState<ProgressData>({
    completedQuizzes: 0,
    averageScore: 0,
    categoryStats: [],
    recentResults: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (!userJson) {
      navigate("/login");
      return;
    }

    const user = JSON.parse(userJson);
    if (user.role !== UserRole.STUDENT) {
      navigate("/login");
      return;
    }

    setCurrentUser(user);
    fetchProgress();
  }, [navigate]);

  const fetchProgress = async () => {
    setIsLoading(true);
    try {
      // Запрос реальных данных с сервера
      const response = await api.get("/student/progress");
      setProgressData(
        response.data || {
          completedQuizzes: 0,
          averageScore: 0,
          categoryStats: [],
          recentResults: [],
        }
      );
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить данные о прогрессе",
      });
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
              <h1 className="text-3xl font-bold">Мой прогресс</h1>
              <p className="text-muted-foreground">
                Отслеживание успеваемости и активности
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl">
                  {progressData.completedQuizzes}
                </CardTitle>
                <CardDescription>Пройдено тестов</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl">
                  {progressData.averageScore
                    ? `${progressData.averageScore.toFixed(1)}%`
                    : "0%"}
                </CardTitle>
                <CardDescription>Средний результат</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border border-border">
              <CardHeader>
                <CardTitle>Прогресс по категориям</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {progressData.categoryStats &&
                    progressData.categoryStats.map((category) => (
                      <div key={category.category}>
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-sm font-medium">
                            {category.category}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {category.quizzesTaken} / {category.totalQuizzes}{" "}
                            тестов
                          </p>
                        </div>
                        <div className="space-y-1">
                          <div
                            className="h-2 rounded-full bg-primary-foreground overflow-hidden"
                            style={{
                              position: "relative",
                              background: "rgb(229, 231, 235)",
                            }}
                          >
                            <div
                              className="h-full bg-primary"
                              style={{
                                width: `${
                                  (category.quizzesTaken /
                                    category.totalQuizzes) *
                                  100
                                }%`,
                                transition: "width 0.3s ease",
                              }}
                            ></div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Средний балл: {category.averageScore.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    ))}

                  {(!progressData.categoryStats ||
                    progressData.categoryStats.length === 0) && (
                    <div className="text-center py-6 text-muted-foreground">
                      Нет данных о прогрессе по категориям
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader>
                <CardTitle>Недавние результаты</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {progressData.recentResults &&
                    progressData.recentResults.map((result) => (
                      <div key={result.id} className="flex border-b pb-3">
                        <div className="flex-grow">
                          <h4 className="font-medium">{result.quizTitle}</h4>
                          <p className="text-sm text-muted-foreground">
                            Результат: {result.score} / {result.maxScore}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(result.date)}
                          </p>
                        </div>
                        <div>
                          <Badge
                            variant={
                              result.score / result.maxScore >= 0.7
                                ? "success"
                                : "destructive"
                            }
                          >
                            {((result.score / result.maxScore) * 100).toFixed(
                              0
                            )}
                            %
                          </Badge>
                        </div>
                      </div>
                    ))}

                  {(!progressData.recentResults ||
                    progressData.recentResults.length === 0) && (
                    <div className="text-center py-6 text-muted-foreground">
                      Нет данных о недавних результатах
                    </div>
                  )}
                </div>
              </CardContent>
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
