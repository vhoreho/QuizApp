import { useParams, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { studentApi } from "@/api/quizApi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { QuizResult } from "@/api/quizApi";

const ResultsPage = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const location = useLocation();
  const resultFromState = location.state?.result as QuizResult | undefined;

  // If we have the result from state, use it, otherwise fetch it
  const { data: result, isLoading: isResultLoading } = useQuery({
    queryKey: ["result", quizId],
    queryFn: () => studentApi.getMyResults(),
    enabled: !resultFromState && !!quizId,
  });

  // We still need the quiz details
  const { data: quiz, isLoading: isQuizLoading } = useQuery({
    queryKey: ["quiz", quizId],
    queryFn: () => studentApi.getQuizById(Number(quizId)),
    enabled: !!quizId,
  });

  const isLoading = isResultLoading || isQuizLoading;
  const quizResult =
    resultFromState ||
    (result && result.find((r) => r.quizId === Number(quizId)));

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
  const passThreshold = 60; // 60% is a passing grade
  const isPassed = quizResult.score >= passThreshold;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-6">
        Результаты теста
      </h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{quiz?.title || "Викторина"}</CardTitle>
          <CardDescription>{quiz?.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1">
              <span className="text-sm text-muted-foreground">
                Ваш результат
              </span>
              <span className="text-3xl font-bold">
                {quizResult.score.toFixed(1)}%
              </span>
            </div>

            <div className="flex flex-col space-y-1">
              <span className="text-sm text-muted-foreground">Статус</span>
              <span
                className={`text-lg font-semibold ${
                  isPassed ? "text-green-500" : "text-red-500"
                }`}
              >
                {isPassed ? "Тест пройден" : "Тест не пройден"}
              </span>
            </div>

            <div className="flex flex-col space-y-1">
              <span className="text-sm text-muted-foreground">
                Правильных ответов
              </span>
              <span className="text-xl font-medium">
                {quizResult.correctAnswers} из {quizResult.totalQuestions}
              </span>
            </div>

            <div className="flex flex-col space-y-1">
              <span className="text-sm text-muted-foreground">
                Проходной балл
              </span>
              <span className="text-xl font-medium">{passThreshold}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultsPage;
