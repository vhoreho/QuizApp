import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, UserRole } from "../../lib/types";
import { Header } from "../../components/layout/header";
import { Button } from "../../components/ui/button";
import { ArrowLeftIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import api from "../../api/axiosConfig";

interface Quiz {
  id: number;
  title: string;
  description: string;
  createdBy: string;
  questionsCount: number;
  estimatedTime: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
}

export default function StudentQuizzes() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
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
    fetchQuizzes();
  }, [navigate]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredQuizzes(quizzes);
    } else {
      const filtered = quizzes.filter(
        (quiz) =>
          quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quiz.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quiz.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredQuizzes(filtered);
    }
  }, [searchTerm, quizzes]);

  const fetchQuizzes = async () => {
    setIsLoading(true);
    try {
      // In a real application, this would fetch from your API
      // const response = await api.get("/student/available-quizzes");
      // setQuizzes(response.data);

      // Mock data for demonstration
      setQuizzes([
        {
          id: 1,
          title: "Основы JavaScript",
          description:
            "Тест на знание основ JavaScript, включая переменные, типы данных и функции",
          createdBy: "Иван Преподаватель",
          questionsCount: 10,
          estimatedTime: "15 мин",
          difficulty: "easy",
          category: "JavaScript",
        },
        {
          id: 2,
          title: "Алгоритмы и структуры данных",
          description: "Тест на знание базовых алгоритмов и структур данных",
          createdBy: "Мария Иванова",
          questionsCount: 8,
          estimatedTime: "20 мин",
          difficulty: "medium",
          category: "Алгоритмы",
        },
        {
          id: 3,
          title: "Основы HTML и CSS",
          description: "Проверка знаний по основам веб-разработки",
          createdBy: "Иван Преподаватель",
          questionsCount: 15,
          estimatedTime: "25 мин",
          difficulty: "easy",
          category: "Веб-разработка",
        },
        {
          id: 4,
          title: "React Основы",
          description: "Тест на знание основ библиотеки React",
          createdBy: "Мария Иванова",
          questionsCount: 12,
          estimatedTime: "30 мин",
          difficulty: "medium",
          category: "JavaScript",
        },
        {
          id: 5,
          title: "Продвинутый JavaScript",
          description: "Тест на знание продвинутых концепций JavaScript",
          createdBy: "Иван Преподаватель",
          questionsCount: 10,
          estimatedTime: "40 мин",
          difficulty: "hard",
          category: "JavaScript",
        },
      ]);
    } catch (err) {
      console.error("Error fetching quizzes:", err);
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

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return <Badge variant="success">Легкий</Badge>;
      case "medium":
        return <Badge>Средний</Badge>;
      case "hard":
        return <Badge variant="destructive">Сложный</Badge>;
      default:
        return <Badge variant="outline">Неизвестно</Badge>;
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
              <h1 className="text-3xl font-bold">Доступные тесты</h1>
              <p className="text-muted-foreground">
                Просмотр и прохождение доступных вам тестов
              </p>
            </div>
          </div>

          <div className="mb-6">
            <div className="relative w-full max-w-sm">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Поиск по названию или категории"
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-4">Загрузка тестов...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredQuizzes.map((quiz) => (
                <Card
                  key={quiz.id}
                  className="border border-border flex flex-col"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{quiz.title}</CardTitle>
                      {getDifficultyBadge(quiz.difficulty)}
                    </div>
                    <CardDescription>{quiz.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Категория:</span>
                        <span className="font-medium text-foreground">
                          {quiz.category}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Вопросов:</span>
                        <span className="font-medium text-foreground">
                          {quiz.questionsCount}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Время:</span>
                        <span className="font-medium text-foreground">
                          {quiz.estimatedTime}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Автор:</span>
                        <span className="font-medium text-foreground">
                          {quiz.createdBy}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      onClick={() => navigate(`/quiz/${quiz.id}`)}
                    >
                      Начать тест
                    </Button>
                  </CardFooter>
                </Card>
              ))}

              {filteredQuizzes.length === 0 && (
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground">
                    Тесты не найдены. Пожалуйста, измените параметры поиска.
                  </p>
                </div>
              )}
            </div>
          )}
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
