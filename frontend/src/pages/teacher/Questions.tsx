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
  CardFooter,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { useToast } from "../../components/ui/use-toast";
import api from "../../api/axiosConfig";
import { authApi } from "../../api/auth";
import { isValidUser } from "@/lib/utils";

interface Question {
  id: number;
  text: string;
  type: "single" | "multiple" | "text";
  difficulty: "easy" | "medium" | "hard";
  category: string;
  usageCount: number;
  createdAt: string;
}

export default function TeacherQuestions() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [categoryFilter, setcategoryFilter] = useState<string>("all");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchUser = async () => {
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
        fetchQuestions();
      } catch (error) {
        console.error("Error fetching user:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate]);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, typeFilter, difficultyFilter, categoryFilter, questions]);

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      // Make actual API call to fetch questions
      const response = await api.get("/teacher/questions");

      if (response.data && Array.isArray(response.data)) {
        setQuestions(response.data);

        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(response.data.map((q) => q.category))
        );
        setCategories(uniqueCategories);

        setFilteredQuestions(response.data);
      } else {
        // Handle empty or invalid response
        setQuestions([]);
        setCategories([]);
        setFilteredQuestions([]);
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Не удалось загрузить вопросы. Неверный формат данных.",
        });
      }
    } catch (err) {
      console.error("Error fetching questions:", err);
      setQuestions([]);
      setCategories([]);
      setFilteredQuestions([]);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description:
          "Не удалось загрузить вопросы. Пожалуйста, попробуйте позже.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...questions];

    // Apply search term filter
    if (searchTerm.trim() !== "") {
      result = result.filter((question) =>
        question.text.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (typeFilter !== "all") {
      result = result.filter((question) => question.type === typeFilter);
    }

    // Apply difficulty filter
    if (difficultyFilter !== "all") {
      result = result.filter(
        (question) => question.difficulty === difficultyFilter
      );
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      result = result.filter(
        (question) => question.category === categoryFilter
      );
    }

    setFilteredQuestions(result);
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

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "single":
        return <Badge variant="outline">Один вариант</Badge>;
      case "multiple":
        return <Badge variant="secondary">Несколько вариантов</Badge>;
      case "text":
        return <Badge variant="default">Текстовый ответ</Badge>;
      default:
        return <Badge variant="outline">Неизвестно</Badge>;
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    try {
      // Make actual API call to delete the question
      await api.delete(`/teacher/questions/${questionId}`);

      // Update local state after successful deletion
      setQuestions(questions.filter((question) => question.id !== questionId));

      toast({
        title: "Вопрос удален",
        description: "Вопрос успешно удален из банка вопросов",
      });
    } catch (err) {
      console.error("Error deleting question:", err);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось удалить вопрос. Пожалуйста, попробуйте позже.",
      });
    }
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
              <h1 className="text-3xl font-bold">Банк вопросов</h1>
              <p className="text-muted-foreground">
                Управление вопросами для тестов
              </p>
            </div>
          </div>

          <Card className="border border-border">
            <CardHeader>
              <CardTitle>Функционал в разработке</CardTitle>
              <CardDescription>
                Банк вопросов скоро будет доступен
              </CardDescription>
            </CardHeader>
            <CardContent className="py-10">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 mb-4 text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-full h-full"
                  >
                    <path d="M12 19h.01"></path>
                    <path d="M12 2a7.5 7.5 0 0 0-7.43 8.539c.08.474.216.934.404 1.372L12 22l7.026-10.089c.188-.438.324-.898.404-1.372a7.5 7.5 0 0 0-2.91-7.257A7.458 7.458 0 0 0 12 2Z"></path>
                    <path d="M11.995 11h.009"></path>
                    <path d="M11.995 7h.009"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-2">
                  Функционал находится в разработке
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Мы работаем над тем, чтобы вы могли создавать и управлять
                  банком вопросов для ваших тестов. Эта функция будет доступна в
                  ближайшее время.
                </p>
                <Button onClick={() => navigate("/teacher/dashboard")}>
                  Вернуться на дашборд
                </Button>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/50 flex justify-center border-t px-6 py-4">
              <p className="text-xs text-muted-foreground">
                Ожидаемое время запуска функционала: скоро
              </p>
            </CardFooter>
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
