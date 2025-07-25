import { Quiz, UserRole } from "@/lib/types";
import { QuizCard } from "./QuizCard";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@radix-ui/react-icons";

interface QuizGridProps {
  quizzes: Quiz[];
  userRole: UserRole;
  isLoading: boolean;
  onCreateQuiz?: () => void;
  onDeleteQuiz?: (quizId: number) => Promise<void>;
  onUpdateQuizStatus?: (quizId: number, isPublished: boolean) => Promise<void>;
  emptyMessage?: string;
  emptyButtonText?: string;
}

export function QuizGrid({
  quizzes,
  userRole,
  isLoading,
  onCreateQuiz,
  onDeleteQuiz,
  onUpdateQuizStatus,
  emptyMessage = "В системе пока нет тестов",
  emptyButtonText = "Создать первый тест",
}: QuizGridProps) {
  if (isLoading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-primary border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  const hasQuizzes = quizzes && quizzes.length > 0;

  // Определяем вариант карточки в зависимости от роли
  const getVariant = () => {
    switch (userRole) {
      case UserRole.ADMIN:
        return "admin";
      case UserRole.TEACHER:
        return "teacher";
      case UserRole.STUDENT:
      default:
        return "student";
    }
  };

  return (
    <div>
      {hasQuizzes ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              variant={getVariant()}
              userRole={userRole}
              onDelete={onDeleteQuiz}
              onStatusChange={onUpdateQuizStatus}
              className="h-full"
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">{emptyMessage}</p>
          {onCreateQuiz && (
            <Button onClick={onCreateQuiz}>
              <PlusIcon className="mr-2 h-4 w-4" />
              {emptyButtonText}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
