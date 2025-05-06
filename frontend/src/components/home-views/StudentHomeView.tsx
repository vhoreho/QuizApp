import { User } from "@/lib/types";
import { QuizCard } from "@/components/quiz/QuizCard";
import { UserRole } from "@/lib/types";
import { MESSAGES } from "@/lib/constants";

interface StudentHomeViewProps {
  quizzes: any[];
  currentUser: User | null;
  hasUserTakenQuiz: (quizId: number) => boolean;
}

export const StudentHomeView = ({
  quizzes,
  currentUser,
  hasUserTakenQuiz,
}: StudentHomeViewProps) => {
  if (quizzes.length === 0) {
    return (
      <div className="bg-muted rounded-lg p-8 text-center">
        <h3 className="text-lg font-medium mb-2">
          {MESSAGES.QUIZZES.EMPTY_QUIZZES}
        </h3>
        <p className="text-muted-foreground mb-4">
          {MESSAGES.QUIZZES.NO_AVAILABLE_QUIZZES}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {quizzes.map((quiz) => (
        <QuizCard
          key={quiz.id}
          quiz={quiz}
          variant="student"
          userRole={UserRole.STUDENT}
          showBadges={false}
          className="h-full"
          hasTaken={hasUserTakenQuiz(quiz.id)}
        />
      ))}
    </div>
  );
};
