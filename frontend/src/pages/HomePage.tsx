import { useQuery } from "@tanstack/react-query";
import { studentApi, teacherApi, adminApi, quizApi } from "@/api/quizApi";
import { UserRole } from "@/lib/types";
import { PAGE_TITLES, MESSAGES } from "@/lib/constants";
import { useStudentResults } from "@/hooks/queries/useQuizzes";
import {
  StudentHomeView,
  TeacherHomeView,
  AdminHomeView,
} from "@/components/home-views";
import { useUser } from "@/contexts/UserContext";

const HomePage = () => {
  // Get user data from context instead of local state
  const { user, isLoading: isUserLoading } = useUser();

  const {
    data: quizzes,
    isLoading: isQuizzesLoading,
    error,
  } = useQuery({
    queryKey: ["quizzes", user?.role],
    queryFn: async () => quizApi.getAllQuizzes(),
    enabled: !!user,
  });

  // Получаем результаты тестов, если пользователь - студент
  const { data: results, isLoading: isResultsLoading } = useStudentResults();

  // Проверяем, прошел ли пользователь тест
  const hasUserTakenQuiz = (quizId: number) => {
    if (!results || user?.role !== UserRole.STUDENT) return false;
    return results.some((result) => result.quizId === quizId);
  };

  const isLoading = isUserLoading || isQuizzesLoading || isResultsLoading;

  if (isLoading) {
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
      {user.role === UserRole.STUDENT && (
        <h1 className="text-3xl font-bold tracking-tight">
          {PAGE_TITLES.HOME}
        </h1>
      )}

      {user && (
        <>
          {user.role === UserRole.STUDENT && (
            <StudentHomeView
              quizzes={quizzes || []}
              currentUser={user}
              hasUserTakenQuiz={hasUserTakenQuiz}
            />
          )}

          {user.role === UserRole.TEACHER && (
            <TeacherHomeView quizzes={quizzes || []} currentUser={user} />
          )}

          {user.role === UserRole.ADMIN && <AdminHomeView />}
        </>
      )}
    </div>
  );
};

export default HomePage;
