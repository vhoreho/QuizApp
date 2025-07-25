import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserRole, QuizSubject, Quiz } from "../../lib/types";
import { Header } from "../../components/layout/header";
import { Button } from "../../components/ui/button";
import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  ResetIcon,
} from "@radix-ui/react-icons";
import { Input } from "../../components/ui/input";
import { QuizCard } from "@/components/quiz/QuizCard";
import { useRequireRole, useLogout } from "@/hooks/queries/useAuth";
import {
  useAvailableQuizzes,
  useStudentResults,
} from "@/hooks/queries/useQuizzes";
import { QuizSubjects } from "@/components/quiz/QuizSubjects";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function StudentQuizzes() {
  const navigate = useNavigate();

  // Проверка аутентификации напрямую
  const userJson = localStorage.getItem("user");
  const token = localStorage.getItem("token");

  let parsedUser = null;
  try {
    if (userJson) {
      parsedUser = JSON.parse(userJson);
    }
  } catch (error) {
    console.error("Error parsing user JSON:", error);
  }

  if (!userJson || !token) {
    useEffect(() => {
      navigate("/login");
    }, []);
    return <div>Redirecting to login...</div>;
  }

  // Используем хук для получения информации о пользователе
  const { user, isLoading: isUserLoading } = useRequireRole([UserRole.STUDENT]);
  const logoutMutation = useLogout();

  // Запрашиваем данные о доступных тестах
  const { data: quizzes, isLoading: isQuizzesLoading } = useAvailableQuizzes();
  // Получаем результаты тестов пользователя
  const { data: results, isLoading: isResultsLoading } = useStudentResults();

  const [filteredQuizzes, setFilteredQuizzes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<
    QuizSubject | undefined
  >(undefined);
  const [viewMode, setViewMode] = useState<"all" | "subjects">("all");

  useEffect(() => {
    if (quizzes) {
      let filtered = [...quizzes];

      // Apply search filter
      if (searchTerm.trim() !== "") {
        filtered = filtered.filter(
          (quiz) =>
            quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            quiz.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Apply subject filter
      if (selectedSubject) {
        filtered = filtered.filter((quiz) => quiz.subject === selectedSubject);
      }

      setFilteredQuizzes(filtered);
    }
  }, [searchTerm, quizzes, selectedSubject]);

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  };

  // Проверяем, прошел ли пользователь тест
  const hasUserTakenQuiz = (quizId: number) => {
    if (!results) return false;
    return results.some((result) => result.quizId === quizId);
  };

  const handleSubjectSelect = (subject: QuizSubject) => {
    if (selectedSubject === subject) {
      // If clicking the same subject, clear the filter
      setSelectedSubject(undefined);
    } else {
      setSelectedSubject(subject);
    }
  };

  const clearFilters = () => {
    setSelectedSubject(undefined);
    setSearchTerm("");
  };

  const isLoading = isUserLoading || isQuizzesLoading || isResultsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-primary border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Use the actual quizzes data
  const displayQuizzes =
    filteredQuizzes && filteredQuizzes.length > 0
      ? filteredQuizzes
      : quizzes || [];
  const hasQuizzes = displayQuizzes.length > 0;

  // Group quizzes by subject
  const quizzesBySubject: Record<string, Quiz[]> = displayQuizzes.reduce(
    (acc: Record<string, Quiz[]>, quiz: Quiz) => {
      const subject = String(quiz.subject);
      if (!acc[subject]) {
        acc[subject] = [];
      }
      acc[subject].push(quiz);
      return acc;
    },
    {}
  );

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header user={user || parsedUser} onLogout={handleLogout} />

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

          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative w-full max-w-sm">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Поиск по названию"
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {(selectedSubject || searchTerm) && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="flex items-center gap-2"
              >
                <ResetIcon className="h-4 w-4" />
                Сбросить фильтры
              </Button>
            )}
          </div>

          <Tabs
            defaultValue="all"
            className="mb-8"
            onValueChange={(value) => setViewMode(value as "all" | "subjects")}
          >
            <TabsList>
              <TabsTrigger value="all">Все тесты</TabsTrigger>
              <TabsTrigger value="subjects">По предметам</TabsTrigger>
            </TabsList>

            <TabsContent value="subjects" className="mt-6">
              <div className="mb-8">
                <h2 className="text-lg font-medium mb-4">Выберите предмет</h2>
                <QuizSubjects
                  selectedSubject={selectedSubject}
                  onSubjectSelect={(subject) =>
                    handleSubjectSelect(subject as QuizSubject)
                  }
                />
              </div>

              {hasQuizzes ? (
                <div className="space-y-10">
                  {Object.entries(quizzesBySubject).map(
                    ([subject, subjectQuizzes]) => (
                      <div key={subject} className="border-t pt-4">
                        <h3 className="text-xl font-bold mb-4 flex items-center">
                          <span className="mr-2">{subject}</span>
                          <Badge variant="outline">
                            {subjectQuizzes.length}
                          </Badge>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {subjectQuizzes.map((quiz) => (
                            <QuizCard
                              key={quiz.id}
                              quiz={quiz}
                              variant="student"
                              userRole={UserRole.STUDENT}
                              onTakeQuiz={(id) => navigate(`/quiz/${id}`)}
                              hasTaken={hasUserTakenQuiz(quiz.id)}
                            />
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="mb-4 text-muted-foreground">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 mx-auto"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium mb-2">Тесты не найдены</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {selectedSubject
                      ? "Нет доступных тестов по выбранному предмету. Попробуйте выбрать другой предмет."
                      : "На данный момент нет доступных тестов для прохождения. Попробуйте выбрать позже."}
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="all" className="mt-6">
              {hasQuizzes ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayQuizzes.map((quiz) => (
                    <QuizCard
                      key={quiz.id}
                      quiz={quiz}
                      variant="student"
                      userRole={UserRole.STUDENT}
                      onTakeQuiz={(id) => navigate(`/quiz/${id}`)}
                      hasTaken={hasUserTakenQuiz(quiz.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="mb-4 text-muted-foreground">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 mx-auto"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium mb-2">Тесты не найдены</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    На данный момент нет доступных тестов для прохождения.
                    Попробуйте проверить позже.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
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
