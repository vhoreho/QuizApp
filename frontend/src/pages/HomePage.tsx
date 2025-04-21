import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { studentApi } from "@/api/quizApi";
import { UserRole, User } from "@/lib/types";
import { authApi } from "@/api/auth";
import { PAGE_TITLES, ROUTES, MESSAGES } from "@/lib/constants";
import { QuizCard } from "@/components/quiz/QuizCard";
import { useStudentResults } from "@/hooks/queries/useQuizzes";

const HomePage = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await authApi.getProfile();
        setCurrentUser(user);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUser();
  }, []);

  const {
    data: quizzes,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["quizzes"],
    queryFn: studentApi.getAvailableQuizzes,
  });

  // Получаем результаты тестов, если пользователь - студент
  const { data: results, isLoading: isResultsLoading } = useStudentResults();

  // Проверяем, прошел ли пользователь тест
  const hasUserTakenQuiz = (quizId: number) => {
    if (!results || currentUser?.role !== UserRole.STUDENT) return false;
    return results.some((result) => result.quizId === quizId);
  };

  // Проверка, может ли пользователь создавать тесты
  const canCreateQuiz =
    currentUser?.role === UserRole.TEACHER ||
    currentUser?.role === UserRole.ADMIN;

  if (isLoading || isResultsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p>{MESSAGES.COMMON.LOADING}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-destructive">{MESSAGES.ERRORS.LOAD_QUIZZES_ERROR}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">
          {PAGE_TITLES.HOME}
        </h1>
        {canCreateQuiz && (
          <Link to={ROUTES.CREATE_QUIZ}>
            <Button>{MESSAGES.QUIZ_CREATION.TITLE}</Button>
          </Link>
        )}
      </div>

      {quizzes && quizzes.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              variant={
                currentUser?.role === UserRole.STUDENT ? "student" : "list"
              }
              userRole={currentUser?.role}
              showBadges={false}
              className="h-full"
              hasTaken={hasUserTakenQuiz(quiz.id)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-muted rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium mb-2">
            {MESSAGES.QUIZZES.EMPTY_QUIZZES}
          </h3>
          <p className="text-muted-foreground mb-4">
            {canCreateQuiz
              ? MESSAGES.QUIZZES.CREATE_FIRST_QUIZ
              : MESSAGES.QUIZZES.NO_AVAILABLE_QUIZZES}
          </p>
          {canCreateQuiz && (
            <Link to={ROUTES.CREATE_QUIZ}>
              <Button>{MESSAGES.QUIZ_CREATION.TITLE}</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default HomePage;
