import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuizResult } from "@/lib/types";
import { Progress } from "@/components/ui/progress";
import { CheckCircledIcon, CrossCircledIcon } from "@radix-ui/react-icons";
import { formatDate } from "./utils";

interface ScoreCardProps {
  quizResult: QuizResult;
  quizTitle?: string;
  quizDescription?: string;
  createdAt?: string;
  onBack: () => void;
}

const ScoreCard = ({
  quizResult,
  quizTitle,
  quizDescription,
  createdAt,
  onBack,
}: ScoreCardProps) => {
  // Определяем, пройден ли тест
  const passThreshold = 4; // 4 из 10 - проходной балл
  const isPassed = quizResult.score >= passThreshold;

  return (
    <Card className="mb-6 max-w-2xl mx-auto">
      <CardHeader className="pb-0 text-center">
        <CardTitle className="text-2xl">{quizTitle || "Тест"}</CardTitle>
        <CardDescription>{quizDescription}</CardDescription>
        {createdAt && (
          <p className="text-xs text-muted-foreground mt-1">
            Пройден: {formatDate(createdAt)}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Большая оценка по центру */}
        <div className="flex flex-col items-center justify-center text-center">
          <span className="text-sm text-muted-foreground mb-1">
            Ваша оценка
          </span>
          <div className="relative flex items-center justify-center">
            <div className="text-6xl font-bold text-primary">
              {quizResult.score.toFixed(1)}
            </div>
            <div className="text-xl text-muted-foreground absolute -right-6 top-2">
              /10
            </div>
          </div>

          {/* Статус прохождения */}
          <div
            className={`mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full ${
              isPassed
                ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
            }`}
          >
            {isPassed ? (
              <CheckCircledIcon className="h-4 w-4" />
            ) : (
              <CrossCircledIcon className="h-4 w-4" />
            )}
            <span className="text-sm font-medium">
              {isPassed ? "Тест пройден" : "Тест не пройден"}
            </span>
          </div>
        </div>

        {/* Прогресс-бар и детали */}
        <div className="space-y-4">
          <Progress value={(quizResult.score / 10) * 100} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0</span>
            <span>4 (проходной балл)</span>
            <span>10</span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="border rounded-md p-3 text-center">
              <span className="text-sm text-muted-foreground">
                Правильные ответы
              </span>
              <div className="font-semibold text-xl mt-1">
                {quizResult.correctAnswers} из {quizResult.totalQuestions}
              </div>
            </div>
            <div className="border rounded-md p-3 text-center">
              <span className="text-sm text-muted-foreground">
                Процент верных
              </span>
              <div className="font-semibold text-xl mt-1">
                {Math.round(
                  (quizResult.correctAnswers / quizResult.totalQuestions) * 100
                )}
                %
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button variant="outline" onClick={onBack} className="w-full">
          Назад к списку тестов
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ScoreCard;
