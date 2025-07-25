import { useNavigate } from "react-router-dom";
import { Quiz, UserRole } from "@/lib/types";
import { ROUTES } from "@/lib/constants";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircledIcon,
  ClockIcon,
  PersonIcon,
  CalendarIcon,
  QuestionMarkCircledIcon,
  PlayIcon,
  BarChartIcon,
  Pencil2Icon,
  TrashIcon,
  EyeOpenIcon,
  RocketIcon,
} from "@radix-ui/react-icons";

interface QuizCardProps {
  quiz: Quiz;
  variant?: "student" | "teacher" | "admin" | "list";
  userRole?: UserRole;
  onTakeQuiz?: (quizId: number) => void;
  onViewResults?: (quizId: number) => void;
  onEdit?: (quizId: number) => void;
  onDelete?: (quizId: number) => void;
  onStatusChange?: (quizId: number, isPublished: boolean) => Promise<void>;
  showBadges?: boolean;
  showFooter?: boolean;
  className?: string;
  hasTaken?: boolean;
}

export function QuizCard({
  quiz,
  variant = "student",
  userRole,
  onTakeQuiz,
  onViewResults,
  onEdit,
  onDelete,
  onStatusChange,
  showBadges = true,
  showFooter = true,
  className = "",
  hasTaken = false,
}: QuizCardProps) {
  const navigate = useNavigate();

  // Обработчики действий
  const handleTakeQuiz = () => {
    if (onTakeQuiz) {
      onTakeQuiz(quiz.id);
    } else {
      navigate(ROUTES.TAKE_QUIZ(quiz.id));
    }
  };

  const handleViewResults = () => {
    if (onViewResults) {
      onViewResults(quiz.id);
    } else {
      navigate(ROUTES.QUIZ_RESULTS(quiz.id));
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(quiz.id);
    } else {
      navigate(ROUTES.EDIT_QUIZ(quiz.id));
    }
  };

  // Определяем, какие действия показывать в футере
  const showTakeQuizButton =
    (variant === "student" || variant === "list") && !hasTaken;
  const showViewResultsButton =
    variant !== "list" || userRole !== UserRole.STUDENT || hasTaken;
  const showEditButton =
    (variant === "teacher" || variant === "admin") &&
    (userRole === UserRole.TEACHER || userRole === UserRole.ADMIN);
  const showDeleteButton =
    variant === "admin" ||
    (variant === "teacher" && userRole === UserRole.TEACHER);
  const showStatusToggle =
    (variant === "teacher" || variant === "admin") &&
    onStatusChange !== undefined;

  // Получаем информацию о сложности теста (если она есть)
  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
      case "легкий":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300 flex items-center gap-1"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
            Легкий
          </Badge>
        );
      case "medium":
      case "средний":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 flex items-center gap-1"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
            Средний
          </Badge>
        );
      case "hard":
      case "сложный":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-300 flex items-center gap-1"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
            Сложный
          </Badge>
        );
      default:
        return null;
    }
  };

  // Выбираем фон в зависимости от типа карточки
  const getCardGradient = () => {
    if (hasTaken) {
      return "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950";
    }

    switch (variant) {
      case "teacher":
        return "bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950 dark:to-purple-950";
      case "admin":
        return "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950";
      default:
        return "bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900";
    }
  };

  return (
    <Card
      className={`border border-border ${getCardGradient()} shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group overflow-hidden ${className}`}
    >
      <CardHeader className="pb-2 relative">
        <div className="absolute top-0 right-0 -mt-3 -mr-3 opacity-5 group-hover:opacity-10 transition-opacity">
          <RocketIcon className="h-32 w-32 text-primary rotate-12" />
        </div>
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="line-clamp-1 group-hover:text-primary transition-colors">
            {quiz.title}
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            {showBadges &&
              (quiz as any).difficulty &&
              getDifficultyBadge((quiz as any).difficulty)}
            {showBadges && (
              <Badge
                variant={quiz.isPublished ? "success" : "secondary"}
                className={
                  quiz.isPublished
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    : ""
                }
              >
                {quiz.isPublished ? "Опубликован" : "Черновик"}
              </Badge>
            )}
            {hasTaken && (
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300 flex items-center gap-1"
              >
                <CheckCircledIcon className="h-3 w-3" />
                Пройден
              </Badge>
            )}
          </div>
        </div>
        <CardDescription className="line-clamp-2 mt-1">
          {quiz.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-grow pt-2">
        <div className="space-y-2.5 text-sm text-muted-foreground">
          {(quiz as any).subject && (
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground font-semibold text-xs">
                  #
                </span>
                <span>Предмет:</span>
              </div>
              <Badge variant="outline" className="font-medium text-primary">
                {(quiz as any).subject}
              </Badge>
            </div>
          )}

          <div className="flex items-center justify-between group">
            <div className="flex items-center gap-1.5">
              <QuestionMarkCircledIcon className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Вопросов:</span>
            </div>
            <span className="font-medium text-foreground">
              {quiz.questions?.length || (quiz as any).questionsCount || "N/A"}
            </span>
          </div>

          {(quiz as any).timeLimit && (
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-1.5">
                <ClockIcon className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Время:</span>
              </div>
              <span className="font-medium text-foreground">
                {(quiz as any).timeLimit} мин
              </span>
            </div>
          )}

          {(quiz as any).createdBy && (
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-1.5">
                <PersonIcon className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Автор:</span>
              </div>
              <span className="font-medium text-foreground">
                {(quiz as any).createdBy.name || "Неизвестно"}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between group">
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Создан:</span>
            </div>
            <span className="font-medium text-foreground">
              {new Date(quiz.createdAt).toLocaleDateString("ru-RU")}
            </span>
          </div>
        </div>
      </CardContent>

      {showFooter && (
        <CardFooter className="flex gap-2 flex-wrap bg-muted/10 mt-3 pt-3 border-t border-border/30">
          {showTakeQuizButton && (
            <Button
              className={`${variant === "list" ? "w-full" : ""} group`}
              onClick={handleTakeQuiz}
            >
              <PlayIcon className="h-3.5 w-3.5 mr-1.5 group-hover:animate-pulse" />
              Начать тест
            </Button>
          )}

          {hasTaken && (
            <Button
              variant="secondary"
              className={`${
                variant === "list" ? "w-full" : ""
              } bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800`}
              onClick={handleViewResults}
            >
              <EyeOpenIcon className="h-3.5 w-3.5 mr-1.5" />
              Показать результаты
            </Button>
          )}

          {showViewResultsButton && !hasTaken && (
            <Button variant="outline" onClick={handleViewResults}>
              <BarChartIcon className="h-3.5 w-3.5 mr-1.5" />
              Результаты
            </Button>
          )}

          {showEditButton && (
            <Button variant="outline" onClick={handleEdit}>
              <Pencil2Icon className="h-3.5 w-3.5 mr-1.5" />
              Редактировать
            </Button>
          )}

          {showDeleteButton && onDelete && (
            <Button variant="destructive" onClick={() => onDelete(quiz.id)}>
              <TrashIcon className="h-3.5 w-3.5 mr-1.5" />
              Удалить
            </Button>
          )}

          {showStatusToggle && onStatusChange && (
            <Button
              variant={quiz.isPublished ? "secondary" : "default"}
              onClick={() => onStatusChange(quiz.id, !quiz.isPublished)}
            >
              {quiz.isPublished ? "Отключить" : "Опубликовать"}
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
