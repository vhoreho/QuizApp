import { useParams, useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuizResult, Result } from "@/lib/types";
import {
  useStudentResults,
  useStudentQuizById,
} from "@/hooks/queries/useQuizzes";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import {
  StarIcon,
  BarChartIcon,
  CheckCircledIcon,
  CheckIcon,
  PieChartIcon,
  CrossCircledIcon,
} from "@radix-ui/react-icons";

const ResultsPage = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  // Получаем результат из state, если он был передан при переходе
  const rawResultFromState = location.state?.result;

  // Преобразуем результат к корректному типу, если он существует
  const resultFromState = rawResultFromState
    ? ({
        id: rawResultFromState.id || 0,
        quizId: rawResultFromState.quizId || Number(quizId),
        score: rawResultFromState.score || 0,
        correctAnswers: rawResultFromState.correctAnswers || 0,
        totalQuestions: rawResultFromState.totalQuestions || 0,
        totalPoints: rawResultFromState.totalPoints,
        maxPossiblePoints: rawResultFromState.maxPossiblePoints,
        partialPoints: rawResultFromState.partialPoints,
      } as QuizResult)
    : undefined;

  // Если у нас есть результат из state, используем его, иначе получаем из API
  const { data: results, isLoading: isResultLoading } = useStudentResults();

  // Нам по-прежнему нужны подробности квиза
  const { data: quiz, isLoading: isQuizLoading } = useStudentQuizById(
    Number(quizId)
  );

  const isLoading = isResultLoading || isQuizLoading;

  // Найдем результат для этого квиза из API результатов, если он не из state
  const resultFromApi = results?.find((r) => r.quizId === Number(quizId));

  // Используем результат из state или из API
  const quizResult = resultFromState || resultFromApi;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p>Загрузка результатов...</p>
      </div>
    );
  }

  if (!quizResult) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-destructive">Результаты не найдены</p>
      </div>
    );
  }

  // Calculate pass status
  const passThreshold = 4; // 4 out of 10 is a passing grade
  const isPassed = quizResult.score >= passThreshold;

  // Получаем цвет прогресса в зависимости от оценки
  const getScoreColor = (score: number) => {
    if (score >= 8) return "bg-green-500";
    if (score >= 6) return "bg-yellow-500";
    if (score >= 4) return "bg-orange-500";
    return "bg-red-500";
  };

  // Рассчитываем среднюю и лучшую оценку для всех тестов пользователя
  const getAverageScore = () => {
    if (!results || results.length === 0) return "N/A";
    const sum = results.reduce((acc, result) => acc + result.score, 0);
    return (sum / results.length).toFixed(1);
  };

  const getBestScore = () => {
    if (!results || results.length === 0) return "N/A";
    const maxScore = Math.max(...results.map((result) => result.score));
    return maxScore.toFixed(1);
  };

  // Проверка, является ли текущий результат лучшим
  const isPersonalBest = () => {
    if (!results || results.length <= 1) return false;
    const maxScore = Math.max(...results.map((result) => result.score));
    return quizResult.score >= maxScore;
  };

  // Сравнение с средней оценкой
  const compareWithAverage = () => {
    if (!results || results.length <= 1) return 0;
    const avgScore =
      results.reduce((acc, result) => acc + result.score, 0) / results.length;
    return quizResult.score - avgScore;
  };

  // Процент выполнения от максимальной оценки 10
  const progressValue = (quizResult.score / 10) * 100;

  // Форматируем дату, если она доступна
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Проверяем, есть ли дополнительные данные о баллах
  const hasPartialPointsData =
    "partialPoints" in quizResult && quizResult.partialPoints !== undefined;

  // Получаем значение partialPoints безопасно
  const getPartialPoints = () => {
    if (hasPartialPointsData && "partialPoints" in quizResult) {
      return (quizResult as QuizResult).partialPoints || 0;
    }
    return 0;
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-3xl font-bold tracking-tight mb-6 text-center">
        Результаты теста
      </h1>

      <Card className="mb-6 shadow-lg border-t-4 border-t-primary rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">{quiz?.title || "Тест"}</CardTitle>
          <CardDescription>{quiz?.description}</CardDescription>
          {resultFromApi?.createdAt && (
            <p className="text-xs text-muted-foreground mt-1">
              Пройден: {formatDate(resultFromApi.createdAt)}
            </p>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Основная оценка */}
          <div className="flex flex-col items-center pt-4 pb-2 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-lg -z-10"></div>
            <span className="text-sm text-muted-foreground mb-2">
              Ваша оценка
            </span>
            <div className="relative">
              <span className="text-5xl font-bold text-primary animate-pulse-subtle">
                {quizResult.score.toFixed(1)}
              </span>
              <div className="absolute -inset-4 bg-primary/10 rounded-full blur-xl opacity-50 -z-10"></div>
            </div>
            <span className="text-sm text-muted-foreground mt-1">
              из 10 возможных баллов
            </span>
          </div>

          {/* Визуальный прогресс */}
          <div className="space-y-2">
            <div className="relative h-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${getScoreColor(
                  quizResult.score
                )} transition-all duration-1000 ease-out rounded-full relative overflow-hidden`}
                style={{ width: `${progressValue}%` }}
              >
                <div className="absolute inset-0 opacity-30 animate-shimmer bg-gradient-to-r from-transparent via-white to-transparent"></div>
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 bg-orange-500 rounded-full"></span>
                {passThreshold} (проходной балл)
              </span>
              <span>10</span>
            </div>
          </div>

          {/* Дополнительная информация */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 border rounded-md bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center mb-2">
                <div className="bg-green-100 dark:bg-green-900 p-1.5 rounded-full mr-2">
                  <CheckIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-muted-foreground">Правильные ответы:</p>
              </div>
              <p className="font-medium text-lg">
                {quizResult.correctAnswers}{" "}
                <span className="text-sm text-muted-foreground">из</span>{" "}
                {quizResult.totalQuestions}
              </p>
            </div>
            <div className="p-3 border rounded-md bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950 dark:to-violet-900 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center mb-2">
                <div className="bg-violet-100 dark:bg-violet-900 p-1.5 rounded-full mr-2">
                  <PieChartIcon className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                </div>
                <p className="text-muted-foreground">Процент выполнения:</p>
              </div>
              <p className="font-medium text-lg">
                {(
                  (quizResult.correctAnswers / quizResult.totalQuestions) *
                  100
                ).toFixed(0)}
                <span className="text-sm">%</span>
              </p>
            </div>
          </div>

          {/* Информация о средней и лучшей оценке */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="relative p-4 border rounded-md bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 shadow-md transition-all duration-300 hover:shadow-lg overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-10 text-blue-500 group-hover:scale-110 transition-transform">
                <BarChartIcon className="h-16 w-16" />
              </div>
              <div className="flex items-center mb-2">
                <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full mr-2">
                  <BarChartIcon className="h-4 w-4 text-blue-500" />
                </div>
                <p className="font-semibold">Средняя оценка</p>
              </div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {getAverageScore()}
              </p>
              <p className="text-xs text-muted-foreground">
                из 10 возможных баллов
              </p>

              {compareWithAverage() !== 0 && (
                <div
                  className={`mt-2 text-xs py-1 px-2 rounded-full inline-block ${
                    compareWithAverage() > 0
                      ? "text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-300"
                      : "text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-300"
                  }`}
                >
                  {compareWithAverage() > 0
                    ? `На ${compareWithAverage().toFixed(1)} выше среднего`
                    : `На ${Math.abs(compareWithAverage()).toFixed(
                        1
                      )} ниже среднего`}
                </div>
              )}
            </div>

            <div className="relative p-4 border rounded-md bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 shadow-md transition-all duration-300 hover:shadow-lg overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-10 text-amber-500 group-hover:scale-110 transition-transform">
                <StarIcon className="h-16 w-16" />
              </div>
              <div className="flex items-center mb-2">
                <div className="bg-amber-100 dark:bg-amber-900 p-2 rounded-full mr-2">
                  <StarIcon className="h-4 w-4 text-amber-500" />
                </div>
                <p className="font-semibold">Лучшая оценка</p>
              </div>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {getBestScore()}
              </p>
              <p className="text-xs text-muted-foreground">
                из 10 возможных баллов
              </p>

              {isPersonalBest() && (
                <div className="mt-2 text-xs py-1 px-2 rounded-full inline-block bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 flex items-center">
                  <CheckCircledIcon className="h-3 w-3 mr-1" />
                  Новый личный рекорд!
                </div>
              )}
            </div>
          </div>

          {/* Дополнительные баллы, если они есть */}
          {quizResult.totalPoints !== undefined &&
            quizResult.maxPossiblePoints !== undefined && (
              <div className="p-4 border rounded-md bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center mb-2">
                  <div className="bg-blue-100 dark:bg-blue-900 p-1.5 rounded-full mr-2">
                    <StarIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-muted-foreground">Набрано баллов:</p>
                </div>
                <p className="font-medium text-lg">
                  {quizResult.totalPoints.toFixed(1)}{" "}
                  <span className="text-sm text-muted-foreground">из</span>{" "}
                  {quizResult.maxPossiblePoints.toFixed(1)}
                </p>
                {hasPartialPointsData && getPartialPoints() > 0 && (
                  <div className="mt-2 px-3 py-1.5 rounded-md bg-blue-100 dark:bg-blue-900/50 text-xs text-muted-foreground">
                    Включая{" "}
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      {getPartialPoints().toFixed(1)}
                    </span>{" "}
                    баллов за частично правильные ответы
                  </div>
                )}
              </div>
            )}

          {/* Статус */}
          <div
            className={`rounded-md p-4 text-center relative overflow-hidden ${
              isPassed
                ? "bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800"
                : "bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800"
            }`}
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer"></div>
            </div>
            <div
              className={`flex items-center justify-center gap-2 text-lg font-semibold ${
                isPassed
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {isPassed ? (
                <CheckCircledIcon className="h-5 w-5" />
              ) : (
                <CrossCircledIcon className="h-5 w-5" />
              )}
              <p>{isPassed ? "Тест успешно пройден!" : "Тест не пройден"}</p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="bg-muted/30">
          <Button
            variant="outline"
            className="w-full hover:bg-primary/10 transition-all duration-300 flex items-center justify-center gap-2"
            onClick={() => navigate("/student/results")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-1"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Вернуться к списку результатов
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResultsPage;
