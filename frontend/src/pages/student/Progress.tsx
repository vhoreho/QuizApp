import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, UserRole } from "../../lib/types";
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
import api from "../../api/axiosConfig";

interface CategoryProgress {
  category: string;
  quizzesTaken: number;
  averageScore: number;
  totalQuizzes: number;
}

interface RecentActivity {
  id: number;
  type: "quiz_completed" | "badge_earned" | "level_up";
  title: string;
  description: string;
  date: string;
}

interface ProgressData {
  totalQuizzesTaken: number;
  averageScore: number;
  currentStreak: number;
  longestStreak: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  categoryProgress: CategoryProgress[];
  recentActivities: RecentActivity[];
  badges: {
    id: number;
    name: string;
    description: string;
    earnedAt: string;
  }[];
}

export default function StudentProgress() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
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
    fetchProgressData();
  }, [navigate]);

  const fetchProgressData = async () => {
    setIsLoading(true);
    try {
      // In a real application, this would fetch from your API
      // const response = await api.get("/student/progress");
      // setProgressData(response.data);

      // Mock data for demonstration
      setProgressData({
        totalQuizzesTaken: 23,
        averageScore: 76,
        currentStreak: 4,
        longestStreak: 7,
        level: 5,
        xp: 1250,
        xpToNextLevel: 2000,
        categoryProgress: [
          {
            category: "JavaScript",
            quizzesTaken: 10,
            averageScore: 82,
            totalQuizzes: 15,
          },
          {
            category: "HTML/CSS",
            quizzesTaken: 5,
            averageScore: 90,
            totalQuizzes: 8,
          },
          {
            category: "Алгоритмы",
            quizzesTaken: 3,
            averageScore: 65,
            totalQuizzes: 10,
          },
          {
            category: "React",
            quizzesTaken: 4,
            averageScore: 72,
            totalQuizzes: 12,
          },
          {
            category: "Базы данных",
            quizzesTaken: 1,
            averageScore: 60,
            totalQuizzes: 5,
          },
        ],
        recentActivities: [
          {
            id: 1,
            type: "quiz_completed",
            title: "Тест пройден: Основы JavaScript",
            description: "Результат: 8/10 (80%)",
            date: "2023-10-15T14:30:00Z",
          },
          {
            id: 2,
            type: "badge_earned",
            title: "Получен значок: JavaScript Новичок",
            description: "Пройдите 5 тестов по JavaScript",
            date: "2023-10-14T11:20:00Z",
          },
          {
            id: 3,
            type: "quiz_completed",
            title: "Тест пройден: Алгоритмы сортировки",
            description: "Результат: 6/8 (75%)",
            date: "2023-10-12T16:45:00Z",
          },
          {
            id: 4,
            type: "level_up",
            title: "Повышение уровня!",
            description: "Достигнут уровень 5",
            date: "2023-10-10T09:15:00Z",
          },
          {
            id: 5,
            type: "quiz_completed",
            title: "Тест пройден: React Основы",
            description: "Результат: 9/12 (75%)",
            date: "2023-10-08T13:30:00Z",
          },
        ],
        badges: [
          {
            id: 1,
            name: "JavaScript Новичок",
            description: "Пройдите 5 тестов по JavaScript",
            earnedAt: "2023-10-14T11:20:00Z",
          },
          {
            id: 2,
            name: "HTML Мастер",
            description: "Получите более 90% в 3 тестах по HTML",
            earnedAt: "2023-09-20T15:45:00Z",
          },
          {
            id: 3,
            name: "Первые шаги",
            description: "Пройдите свой первый тест",
            earnedAt: "2023-09-05T10:30:00Z",
          },
        ],
      });
    } catch (err) {
      console.error("Error fetching progress data:", err);
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
    });
  };

  const getCategoryProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-success";
    if (progress >= 60) return "bg-primary";
    if (progress >= 40) return "bg-secondary";
    return "bg-destructive";
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "quiz_completed":
        return "📝";
      case "badge_earned":
        return "🏆";
      case "level_up":
        return "⭐";
      default:
        return "📌";
    }
  };

  if (!currentUser || !progressData) {
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
              <h1 className="text-3xl font-bold">Мой прогресс</h1>
              <p className="text-muted-foreground">
                Отслеживание вашего обучения и достижений
              </p>
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card className="border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl">
                  {progressData.totalQuizzesTaken}
                </CardTitle>
                <CardDescription>Пройдено тестов</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl">
                  {progressData.averageScore}%
                </CardTitle>
                <CardDescription>Средний результат</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl">
                  Уровень {progressData.level}
                </CardTitle>
                <CardDescription>
                  {progressData.xp} / {progressData.xpToNextLevel} XP
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div
                    className="bg-primary h-2.5 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        (progressData.xp / progressData.xpToNextLevel) * 100
                      )}%`,
                    }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl">
                  {progressData.currentStreak} дней
                </CardTitle>
                <CardDescription>
                  Текущая серия ({progressData.longestStreak} макс.)
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Category Progress */}
            <Card className="border border-border lg:col-span-2">
              <CardHeader>
                <CardTitle>Прогресс по категориям</CardTitle>
                <CardDescription>
                  Ваш прогресс по различным категориям тестов
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {progressData.categoryProgress.map((category) => (
                    <div key={category.category}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">
                          {category.category}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {category.quizzesTaken} из {category.totalQuizzes}{" "}
                          тестов
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div
                          className={`${getCategoryProgressColor(
                            category.averageScore
                          )} h-2.5 rounded-full`}
                          style={{
                            width: `${Math.min(
                              100,
                              (category.quizzesTaken / category.totalQuizzes) *
                                100
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-muted-foreground">
                          Средний балл: {category.averageScore}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Badges */}
            <Card className="border border-border">
              <CardHeader>
                <CardTitle>Мои достижения</CardTitle>
                <CardDescription>Полученные значки и награды</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {progressData.badges.map((badge) => (
                    <div
                      key={badge.id}
                      className="flex items-start p-3 rounded-lg border border-border"
                    >
                      <div className="flex-shrink-0 mr-3 bg-primary/10 rounded-full p-2">
                        <span className="text-xl">🏆</span>
                      </div>
                      <div>
                        <h4 className="font-medium">{badge.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {badge.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Получено: {formatDate(badge.earnedAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="border border-border mt-6">
            <CardHeader>
              <CardTitle>Недавняя активность</CardTitle>
              <CardDescription>
                Ваша последняя активность в системе
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {progressData.recentActivities.map((activity) => (
                  <div key={activity.id} className="flex">
                    <div className="flex-shrink-0 mr-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                        <span>{getActivityIcon(activity.type)}</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium">{activity.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(activity.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
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
