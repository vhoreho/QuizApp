import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User } from "@/lib/types";
import { QuizCard } from "@/components/quiz/QuizCard";
import { UserRole } from "@/lib/types";
import { ROUTES, MESSAGES } from "@/lib/constants";
import { FileUp, PlusCircle } from "lucide-react";

interface TeacherHomeViewProps {
  quizzes: any[];
  currentUser: User | null;
}

export const TeacherHomeView = ({
  quizzes,
  currentUser,
}: TeacherHomeViewProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold tracking-tight">Ваши тесты</h2>
        <div className="flex space-x-2">
          <Link to={ROUTES.IMPORT_QUIZ}>
            <Button variant="outline">
              <FileUp className="mr-2 h-4 w-4" />
              Импорт из файла
            </Button>
          </Link>
          <Link to={ROUTES.CREATE_QUIZ}>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              {MESSAGES.QUIZ_CREATION.TITLE}
            </Button>
          </Link>
        </div>
      </div>

      {quizzes.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              variant="list"
              userRole={UserRole.TEACHER}
              showBadges={true}
              className="h-full"
              onViewResults={() =>
                navigate(`/teacher/quizzes/${quiz.id}/results`)
              }
            />
          ))}
        </div>
      ) : (
        <div className="bg-muted rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium mb-2">
            {MESSAGES.QUIZZES.EMPTY_QUIZZES}
          </h3>
          <p className="text-muted-foreground mb-4">
            {MESSAGES.QUIZZES.CREATE_FIRST_QUIZ}
          </p>
          <div className="flex justify-center space-x-4">
            <Link to={ROUTES.IMPORT_QUIZ}>
              <Button variant="outline">
                <FileUp className="mr-2 h-4 w-4" />
                Импорт из файла
              </Button>
            </Link>
            <Link to={ROUTES.CREATE_QUIZ}>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                {MESSAGES.QUIZ_CREATION.TITLE}
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
