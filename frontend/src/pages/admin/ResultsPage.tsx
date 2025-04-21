import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeftIcon,
  BarChartIcon,
  MagnifyingGlassIcon,
  ResetIcon,
  CalendarIcon,
  ReaderIcon,
  PersonIcon,
  CrossCircledIcon,
  TableIcon,
  CheckCircledIcon,
  ArrowUpIcon,
  ArrowDownIcon,
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
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useRequireRole, useLogout } from "@/hooks/queries/useAuth";
import { UserRole } from "@/lib/types";
import { useAllResults } from "@/hooks/queries/useQuizzes";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { addDays, format } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function AdminResultsPage() {
  const navigate = useNavigate();
  const logoutMutation = useLogout();

  // Состояние для фильтров
  const [filters, setFilters] = useState({
    username: "",
    quizTitle: "",
    dateFrom: undefined as Date | undefined,
    dateTo: undefined as Date | undefined,
    includePractice: false,
  });

  // Состояние для строки поиска
  const [searchQuery, setSearchQuery] = useState("");

  // Проверяем доступ и получаем профиль пользователя
  const { user, isLoading: isUserLoading } = useRequireRole([UserRole.ADMIN]);

  // Получаем данные результатов с учетом фильтров
  const {
    data: results,
    isLoading: isResultsLoading,
    refetch,
  } = useAllResults({
    username: filters.username,
    quizTitle: filters.quizTitle,
    dateFrom: filters.dateFrom
      ? format(filters.dateFrom, "yyyy-MM-dd")
      : undefined,
    dateTo: filters.dateTo ? format(filters.dateTo, "yyyy-MM-dd") : undefined,
  });

  const isLoading = isUserLoading || isResultsLoading;

  // Статистика
  const totalResults = results?.length || 0;

  const averageScore = results?.length
    ? results.reduce((sum, result) => sum + result.score, 0) / results.length
    : 0;

  const highScores = results?.filter((result) => result.score >= 8).length || 0;
  const passRate = results?.length ? (highScores / results.length) * 100 : 0;

  // Сортировка
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedResults = [...(results || [])].sort((a, b) => {
    if (!sortField) return 0;

    let valA: any, valB: any;

    // Специальная обработка для полей с вложенными объектами
    if (sortField === "user.username") {
      valA = a.user?.username || "";
      valB = b.user?.username || "";
    } else if (sortField === "quiz.title") {
      valA = a.quiz?.title || "";
      valB = b.quiz?.title || "";
    } else {
      valA = a[sortField as keyof typeof a];
      valB = b[sortField as keyof typeof b];
    }

    // Преобразование для дат
    if (sortField === "createdAt") {
      valA = new Date(valA).getTime();
      valB = new Date(valB).getTime();
    }

    if (valA < valB) return sortDirection === "asc" ? -1 : 1;
    if (valA > valB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  };

  const handleResetFilters = () => {
    setFilters({
      username: "",
      quizTitle: "",
      dateFrom: undefined,
      dateTo: undefined,
      includePractice: false,
    });
    setSearchQuery("");
  };

  const handleApplyFilters = () => {
    refetch();
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

  const getScoreBadge = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 10;

    if (percentage >= 8) {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
          Отлично
        </Badge>
      );
    } else if (percentage >= 6) {
      return (
        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
          Хорошо
        </Badge>
      );
    } else if (percentage >= 4) {
      return (
        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
          Удовлетворительно
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
          Неудовлетворительно
        </Badge>
      );
    }
  };

  const applySearchFilter = () => {
    // Применяем поиск, разбивая запрос на части
    const searchTerms = searchQuery.toLowerCase().split(" ");

    if (searchTerms.some((term) => term.startsWith("user:"))) {
      const usernameTerm = searchTerms
        .find((term) => term.startsWith("user:"))
        ?.substring(5);
      setFilters({ ...filters, username: usernameTerm || "" });
    }

    if (searchTerms.some((term) => term.startsWith("quiz:"))) {
      const quizTitleTerm = searchTerms
        .find((term) => term.startsWith("quiz:"))
        ?.substring(5);
      setFilters({ ...filters, quizTitle: quizTitleTerm || "" });
    }

    if (
      !searchTerms.some((term) => term.startsWith("user:")) &&
      !searchTerms.some((term) => term.startsWith("quiz:"))
    ) {
      setFilters({ ...filters, username: searchQuery, quizTitle: searchQuery });
    }
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

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header user={user!} onLogout={handleLogout} />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center">
              <Button
                variant="ghost"
                className="flex items-center text-muted-foreground mr-4 hover:bg-muted/30 transition-colors group"
                onClick={() => navigate("/admin/dashboard")}
              >
                <ArrowLeftIcon className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Назад
              </Button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                  <div className="bg-indigo-100 dark:bg-indigo-900 p-1.5 rounded-full">
                    <BarChartIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  Результаты тестирования
                </h1>
                <p className="text-muted-foreground">
                  Просмотр и анализ результатов всех тестов в системе
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card
              withSticky
              className="border border-border bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950 dark:to-sky-950 shadow-md hover:shadow-lg transition-all duration-300 group overflow-hidden"
            >
              <CardHeader className="py-4 pb-0 relative">
                <div className="absolute top-0 right-0 -mt-6 -mr-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <TableIcon className="h-24 w-24 text-blue-500 rotate-12" />
                </div>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <div className="bg-blue-100 dark:bg-blue-900 p-1 rounded-full">
                    <TableIcon className="h-3.5 w-3.5 text-blue-500" />
                  </div>
                  Всего результатов
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3 pb-4">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                  {isResultsLoading ? (
                    <Skeleton className="h-9 w-16" />
                  ) : (
                    totalResults
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1 flex items-center">
                  <ReaderIcon className="h-3 w-3 mr-1 text-blue-500" />
                  <span>Завершенных тестирований</span>
                </div>
              </CardContent>
            </Card>

            <Card
              withSticky
              className="border border-border bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 shadow-md hover:shadow-lg transition-all duration-300 group overflow-hidden"
            >
              <CardHeader className="py-4 pb-0 relative">
                <div className="absolute top-0 right-0 -mt-6 -mr-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <BarChartIcon className="h-24 w-24 text-green-500 rotate-12" />
                </div>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <div className="bg-green-100 dark:bg-green-900 p-1 rounded-full">
                    <BarChartIcon className="h-3.5 w-3.5 text-green-500" />
                  </div>
                  Средний балл
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3 pb-4">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors">
                  {isResultsLoading ? (
                    <Skeleton className="h-9 w-16" />
                  ) : (
                    averageScore.toFixed(1)
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1 flex items-center">
                  <CheckCircledIcon className="h-3 w-3 mr-1 text-green-500" />
                  <span>По всем результатам</span>
                </div>
              </CardContent>
            </Card>

            <Card
              withSticky
              className="border border-border bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 shadow-md hover:shadow-lg transition-all duration-300 group overflow-hidden"
            >
              <CardHeader className="py-4 pb-0 relative">
                <div className="absolute top-0 right-0 -mt-6 -mr-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <CheckCircledIcon className="h-24 w-24 text-indigo-500 rotate-12" />
                </div>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <div className="bg-indigo-100 dark:bg-indigo-900 p-1 rounded-full">
                    <CheckCircledIcon className="h-3.5 w-3.5 text-indigo-500" />
                  </div>
                  Высокие оценки
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3 pb-4">
                <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                  {isResultsLoading ? (
                    <Skeleton className="h-9 w-16" />
                  ) : (
                    `${passRate.toFixed(1)}%`
                  )}
                </div>
                <div className="flex gap-2 mt-2">
                  <Badge
                    variant="outline"
                    className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300"
                  >
                    {highScores} отличных результатов
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-100 dark:border-indigo-800/30 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск по имени пользователя или названию теста..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        applySearchFilter();
                      }
                    }}
                    className="pl-9 bg-white/80 dark:bg-slate-950/80 border-indigo-100 dark:border-indigo-800/30"
                  />
                </div>
                <div className="text-xs mt-1 text-muted-foreground">
                  Используйте префиксы: user:имя или quiz:название
                </div>
              </div>

              <div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal bg-white/80 dark:bg-slate-950/80 border-indigo-100 dark:border-indigo-800/30 hover:bg-indigo-50 dark:hover:bg-indigo-950"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateFrom
                        ? format(filters.dateFrom, "dd.MM.yyyy", { locale: ru })
                        : "Дата с..."}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.dateFrom}
                      onSelect={(date) =>
                        setFilters({ ...filters, dateFrom: date })
                      }
                      className="rounded-md border"
                      disabled={(date) =>
                        filters.dateTo ? date > filters.dateTo : false
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal bg-white/80 dark:bg-slate-950/80 border-indigo-100 dark:border-indigo-800/30 hover:bg-indigo-50 dark:hover:bg-indigo-950"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateTo
                        ? format(filters.dateTo, "dd.MM.yyyy", { locale: ru })
                        : "Дата по..."}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.dateTo}
                      onSelect={(date) =>
                        setFilters({
                          ...filters,
                          dateTo: date ? addDays(date, 1) : undefined,
                        })
                      }
                      className="rounded-md border"
                      disabled={(date) =>
                        filters.dateFrom ? date < filters.dateFrom : false
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex items-center">
                <div className="bg-white/80 dark:bg-slate-950/80 rounded-md border border-indigo-100 dark:border-indigo-800/30 hover:bg-indigo-50 dark:hover:bg-indigo-950 py-2 px-4 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="includePractice"
                    className="rounded border-indigo-200 text-indigo-600 focus:ring-indigo-300"
                    checked={filters.includePractice}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        includePractice: e.target.checked,
                      })
                    }
                  />
                  <label
                    htmlFor="includePractice"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Показать практические тесты
                  </label>
                </div>
              </div>

              <div>
                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-700 group"
                  onClick={handleResetFilters}
                >
                  <ResetIcon className="mr-2 h-4 w-4 group-hover:animate-spin" />
                  Сбросить фильтры
                </Button>
              </div>
            </div>
          </div>

          <Card
            withSticky
            className="border border-indigo-100 dark:border-indigo-800/30 rounded-lg bg-white/80 dark:bg-slate-950/80 shadow-md overflow-hidden h-[calc(100vh-450px)] min-h-[500px]"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TableIcon className="h-5 w-5 text-indigo-500" />
                Результаты тестирования
              </CardTitle>
              <CardDescription>
                {filters.username ||
                filters.quizTitle ||
                filters.dateFrom ||
                filters.dateTo ||
                filters.includePractice ? (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {filters.username && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        <PersonIcon className="h-3 w-3" />
                        Пользователь: {filters.username}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 ml-1"
                          onClick={() =>
                            setFilters({ ...filters, username: "" })
                          }
                        >
                          <CrossCircledIcon className="h-3 w-3" />
                        </Button>
                      </Badge>
                    )}
                    {filters.quizTitle && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        <ReaderIcon className="h-3 w-3" />
                        Тест: {filters.quizTitle}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 ml-1"
                          onClick={() =>
                            setFilters({ ...filters, quizTitle: "" })
                          }
                        >
                          <CrossCircledIcon className="h-3 w-3" />
                        </Button>
                      </Badge>
                    )}
                    {filters.dateFrom && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        <CalendarIcon className="h-3 w-3" />
                        С:{" "}
                        {format(filters.dateFrom, "dd.MM.yyyy", { locale: ru })}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 ml-1"
                          onClick={() =>
                            setFilters({ ...filters, dateFrom: undefined })
                          }
                        >
                          <CrossCircledIcon className="h-3 w-3" />
                        </Button>
                      </Badge>
                    )}
                    {filters.dateTo && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        <CalendarIcon className="h-3 w-3" />
                        По:{" "}
                        {format(filters.dateTo, "dd.MM.yyyy", { locale: ru })}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 ml-1"
                          onClick={() =>
                            setFilters({ ...filters, dateTo: undefined })
                          }
                        >
                          <CrossCircledIcon className="h-3 w-3" />
                        </Button>
                      </Badge>
                    )}
                    {filters.includePractice && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1 bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                      >
                        <ReaderIcon className="h-3 w-3" />
                        Включая практические тесты
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 ml-1"
                          onClick={() =>
                            setFilters({ ...filters, includePractice: false })
                          }
                        >
                          <CrossCircledIcon className="h-3 w-3" />
                        </Button>
                      </Badge>
                    )}
                  </div>
                ) : (
                  "Все результаты тестирования в системе"
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isResultsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : sortedResults.length > 0 ? (
                <div className="rounded-md border border-indigo-100 dark:border-indigo-800/30 overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-indigo-50/50 dark:bg-indigo-950/50">
                      <TableRow className="hover:bg-indigo-100/50 dark:hover:bg-indigo-900/20">
                        <TableHead
                          className="text-indigo-700 dark:text-indigo-300 cursor-pointer"
                          onClick={() => toggleSort("id")}
                        >
                          <div className="flex items-center">
                            ID
                            {sortField === "id" &&
                              (sortDirection === "asc" ? (
                                <ArrowUpIcon className="ml-1 h-3 w-3" />
                              ) : (
                                <ArrowDownIcon className="ml-1 h-3 w-3" />
                              ))}
                          </div>
                        </TableHead>
                        <TableHead
                          className="text-indigo-700 dark:text-indigo-300 cursor-pointer"
                          onClick={() => toggleSort("user.username")}
                        >
                          <div className="flex items-center">
                            Пользователь
                            {sortField === "user.username" &&
                              (sortDirection === "asc" ? (
                                <ArrowUpIcon className="ml-1 h-3 w-3" />
                              ) : (
                                <ArrowDownIcon className="ml-1 h-3 w-3" />
                              ))}
                          </div>
                        </TableHead>
                        <TableHead
                          className="text-indigo-700 dark:text-indigo-300 cursor-pointer"
                          onClick={() => toggleSort("quiz.title")}
                        >
                          <div className="flex items-center">
                            Название теста
                            {sortField === "quiz.title" &&
                              (sortDirection === "asc" ? (
                                <ArrowUpIcon className="ml-1 h-3 w-3" />
                              ) : (
                                <ArrowDownIcon className="ml-1 h-3 w-3" />
                              ))}
                          </div>
                        </TableHead>
                        <TableHead
                          className="text-indigo-700 dark:text-indigo-300 cursor-pointer"
                          onClick={() => toggleSort("score")}
                        >
                          <div className="flex items-center">
                            Балл
                            {sortField === "score" &&
                              (sortDirection === "asc" ? (
                                <ArrowUpIcon className="ml-1 h-3 w-3" />
                              ) : (
                                <ArrowDownIcon className="ml-1 h-3 w-3" />
                              ))}
                          </div>
                        </TableHead>
                        <TableHead
                          className="text-indigo-700 dark:text-indigo-300 cursor-pointer"
                          onClick={() => toggleSort("createdAt")}
                        >
                          <div className="flex items-center">
                            Дата
                            {sortField === "createdAt" &&
                              (sortDirection === "asc" ? (
                                <ArrowUpIcon className="ml-1 h-3 w-3" />
                              ) : (
                                <ArrowDownIcon className="ml-1 h-3 w-3" />
                              ))}
                          </div>
                        </TableHead>
                        <TableHead className="text-right text-indigo-700 dark:text-indigo-300">
                          Оценка
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedResults.map((result) => (
                        <TableRow
                          key={result.id}
                          className={cn(
                            "hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-colors",
                            result.isPractice &&
                              "bg-amber-50/50 dark:bg-amber-900/10"
                          )}
                        >
                          <TableCell className="font-medium">
                            {result.id}
                          </TableCell>
                          <TableCell>
                            {result.user?.username || "Пользователь удален"}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>
                                {result.quiz?.title || `Тест #${result.quizId}`}
                              </span>
                              {result.isPractice && (
                                <Badge
                                  variant="outline"
                                  className="mt-1 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 text-xs w-fit"
                                >
                                  Практический тест
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {result.score}/{result.maxPossiblePoints}
                          </TableCell>
                          <TableCell>{formatDate(result.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            {getScoreBadge(
                              result.score,
                              result.maxPossiblePoints
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <CrossCircledIcon className="h-12 w-12 mb-4 text-muted-foreground/30" />
                    <p className="text-lg font-medium mb-2">
                      Результаты не найдены
                    </p>
                    <p className="text-sm max-w-md">
                      Не найдено результатов тестирования, соответствующих
                      заданным критериям фильтрации.
                    </p>
                    {(filters.username ||
                      filters.quizTitle ||
                      filters.dateFrom ||
                      filters.dateTo ||
                      filters.includePractice) && (
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={handleResetFilters}
                      >
                        <ResetIcon className="mr-2 h-4 w-4" />
                        Сбросить фильтры
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="bg-gradient-to-r from-indigo-50/50 to-indigo-100/50 dark:from-indigo-950/50 dark:to-indigo-900/50 border-t border-indigo-100 dark:border-indigo-800/30 flex justify-between">
              <div className="text-sm text-muted-foreground">
                {isResultsLoading ? (
                  <Skeleton className="h-4 w-40" />
                ) : (
                  `Показано ${sortedResults.length} из ${totalResults} результатов`
                )}
              </div>
              <Button
                variant="outline"
                className="border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/30"
                onClick={() => navigate("/admin/quizzes")}
              >
                <ReaderIcon className="mr-2 h-4 w-4" />К управлению тестами
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
