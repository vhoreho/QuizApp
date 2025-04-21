import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {
  CalendarIcon,
  MagnifyingGlassIcon,
  ResetIcon,
  CaretSortIcon,
} from "@radix-ui/react-icons";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useRequireRole, useLogout } from "@/hooks/queries/useAuth";
import { UserRole, Result } from "@/lib/types";
import {
  useTeacherQuizzes,
  useTeacherMyResults,
} from "@/hooks/queries/useQuizzes";

export default function TeacherResultsPage() {
  const navigate = useNavigate();
  const logoutMutation = useLogout();

  // Проверяем роль пользователя
  const { user, isLoading: isUserLoading } = useRequireRole([UserRole.TEACHER]);

  // Фильтры
  const [filters, setFilters] = useState<{
    username: string;
    quizTitle: string;
    dateFrom: Date | undefined;
    dateTo: Date | undefined;
  }>({
    username: "",
    quizTitle: "",
    dateFrom: undefined,
    dateTo: undefined,
  });

  // Состояние для поиска
  const [searchQuery, setSearchQuery] = useState("");

  // Получаем тесты преподавателя
  const { data: quizzes = [], isLoading: isQuizzesLoading } =
    useTeacherQuizzes();

  // Получаем результаты прохождения тестов
  const { data: teacherResults, isLoading: isResultsLoading } =
    useTeacherMyResults({
      username: filters.username,
      quizTitle: filters.quizTitle,
      dateFrom: filters.dateFrom
        ? format(filters.dateFrom, "yyyy-MM-dd")
        : undefined,
      dateTo: filters.dateTo ? format(filters.dateTo, "yyyy-MM-dd") : undefined,
    });

  const results = teacherResults || [];

  // Статистика
  const totalResults = results.length;

  const averageScore = results.length
    ? results.reduce((sum: number, result: Result) => sum + result.score, 0) /
      results.length
    : 0;

  const highScores = results.filter(
    (result: Result) => result.score >= 8
  ).length;
  const passRate = results.length ? (highScores / results.length) * 100 : 0;

  // Сортировка
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedResults = [...results].sort((a, b) => {
    if (!sortField) return 0;

    const direction = sortDirection === "asc" ? 1 : -1;

    switch (sortField) {
      case "id":
        return direction * (a.id - b.id);
      case "username":
        return (
          direction *
          (a.user?.username || "").localeCompare(b.user?.username || "")
        );
      case "quizTitle":
        return (
          direction * (a.quiz?.title || "").localeCompare(b.quiz?.title || "")
        );
      case "score":
        return direction * (a.score - b.score);
      case "correctAnswers":
        return direction * (a.correctAnswers - b.correctAnswers);
      case "date":
        return (
          direction * new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime()
        );
      default:
        return 0;
    }
  });

  const isLoading = isUserLoading || isQuizzesLoading || isResultsLoading;

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd.MM.yyyy HH:mm", { locale: ru });
    } catch (error) {
      return "Недействительная дата";
    }
  };

  const resetFilters = () => {
    setFilters({
      username: "",
      quizTitle: "",
      dateFrom: undefined,
      dateTo: undefined,
    });
    setSearchQuery("");
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-primary border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Фильтрация по поисковому запросу
  const filteredResults = sortedResults.filter((result) => {
    if (!searchQuery) return true;
    const lowerQuery = searchQuery.toLowerCase();
    return (
      (result.user?.username || "").toLowerCase().includes(lowerQuery) ||
      (result.quiz?.title || "").toLowerCase().includes(lowerQuery)
    );
  });

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header user={user!} onLogout={handleLogout} />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Результаты тестов</h1>
              <p className="text-muted-foreground">
                Просмотр результатов прохождения ваших тестов
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => navigate("/teacher/dashboard")}
              className="flex items-center gap-2"
            >
              <span className="rotate-180">➔</span>
              Назад к панели
            </Button>
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950 dark:to-purple-950">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Всего результатов</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold">{totalResults}</div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Средняя оценка</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold">
                    {averageScore.toFixed(1)}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Высокие баллы</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold">{highScores}</div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950 dark:to-teal-950">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Процент успешных</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold">
                    {passRate.toFixed(1)}%
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Фильтры */}
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Фильтры</CardTitle>
              <CardDescription>
                Используйте фильтры для поиска конкретных результатов
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Поиск по имени пользователя или названию теста..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateFrom ? (
                          <>
                            От{" "}
                            {format(filters.dateFrom, "dd.MM.yyyy", {
                              locale: ru,
                            })}
                          </>
                        ) : (
                          <>Дата начала</>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.dateFrom}
                        onSelect={(date) =>
                          setFilters({ ...filters, dateFrom: date })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateTo ? (
                          <>
                            До{" "}
                            {format(filters.dateTo, "dd.MM.yyyy", {
                              locale: ru,
                            })}
                          </>
                        ) : (
                          <>Дата окончания</>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.dateTo}
                        onSelect={(date) =>
                          setFilters({ ...filters, dateTo: date })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="username" className="text-sm font-medium">
                      Имя пользователя
                    </label>
                    <Input
                      id="username"
                      placeholder="Фильтр по имени пользователя"
                      value={filters.username}
                      onChange={(e) =>
                        setFilters({ ...filters, username: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label htmlFor="quizTitle" className="text-sm font-medium">
                      Название теста
                    </label>
                    <Input
                      id="quizTitle"
                      placeholder="Фильтр по названию теста"
                      value={filters.quizTitle}
                      onChange={(e) =>
                        setFilters({ ...filters, quizTitle: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button
                    className="w-full bg-indigo-600 hover:bg-indigo-700 group"
                    onClick={resetFilters}
                  >
                    <ResetIcon className="mr-2 h-4 w-4 group-hover:animate-spin" />
                    Сбросить фильтры
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Таблица результатов */}
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : filteredResults.length > 0 ? (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      onClick={() => handleSort("id")}
                      className="cursor-pointer hover:bg-accent/50"
                    >
                      <div className="flex items-center">
                        ID
                        {sortField === "id" && (
                          <CaretSortIcon className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      onClick={() => handleSort("username")}
                      className="cursor-pointer hover:bg-accent/50"
                    >
                      <div className="flex items-center">
                        Пользователь
                        {sortField === "username" && (
                          <CaretSortIcon className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      onClick={() => handleSort("quizTitle")}
                      className="cursor-pointer hover:bg-accent/50"
                    >
                      <div className="flex items-center">
                        Тест
                        {sortField === "quizTitle" && (
                          <CaretSortIcon className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      onClick={() => handleSort("score")}
                      className="cursor-pointer hover:bg-accent/50 text-center"
                    >
                      <div className="flex items-center justify-center">
                        Оценка
                        {sortField === "score" && (
                          <CaretSortIcon className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      onClick={() => handleSort("correctAnswers")}
                      className="cursor-pointer hover:bg-accent/50 text-center"
                    >
                      <div className="flex items-center justify-center">
                        Правильных
                        {sortField === "correctAnswers" && (
                          <CaretSortIcon className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      onClick={() => handleSort("date")}
                      className="cursor-pointer hover:bg-accent/50 text-center"
                    >
                      <div className="flex items-center justify-center">
                        Дата
                        {sortField === "date" && (
                          <CaretSortIcon className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="text-center">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResults.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell className="font-medium">{result.id}</TableCell>
                      <TableCell>{result.user?.username || "Удален"}</TableCell>
                      <TableCell>{result.quiz?.title || "Удален"}</TableCell>
                      <TableCell className="text-center">
                        <Badge
                          className={`${
                            result.score >= 8
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : result.score >= 6
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                              : result.score >= 4
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                          }`}
                        >
                          {result.score.toFixed(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {result.correctAnswers}/{result.totalQuestions}
                      </TableCell>
                      <TableCell className="text-center">
                        {formatDate(result.createdAt)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            navigate(
                              `/quiz-results/${result.quizId}/${result.id}`
                            )
                          }
                        >
                          Подробнее
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center p-12 bg-muted/20 rounded-lg border border-dashed">
              <h3 className="text-lg font-medium mb-2">
                Результаты не найдены
              </h3>
              <p className="text-muted-foreground">
                По вашему запросу не найдено ни одного результата.
                {results.length > 0 ? (
                  <>
                    <br />
                    Попробуйте изменить параметры фильтрации или поиска.
                    <br />
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={resetFilters}
                    >
                      <ResetIcon className="mr-2 h-4 w-4" />
                      Сбросить фильтры
                    </Button>
                  </>
                ) : (
                  <>
                    <br />
                    Студенты еще не прошли ни одного вашего теста.
                  </>
                )}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
