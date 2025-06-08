import { useParams, useLocation, useNavigate } from "react-router-dom";
import { QuizResult } from "@/lib/types";
import {
  useStudentResults,
  useStudentQuizById,
} from "@/hooks/queries/useQuizzes";
import {
  ScoreCard,
  AnswersList,
  useResultAnswers,
} from "@/components/quiz-results";

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

  // Получаем ответы пользователя
  const { data: answersData, isLoading: isAnswersLoading } = useResultAnswers(
    resultFromApi?.id
  );

  if (isLoading || isAnswersLoading) {
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

  return (
    <div className="container mx-auto p-4">
      <ScoreCard
        quizResult={quizResult}
        quizTitle={quiz?.title}
        quizDescription={quiz?.description}
        createdAt={resultFromApi?.createdAt}
        onBack={() => navigate(-1)}
      />

      {/* Ответы пользователя */}
      {resultFromApi?.id &&
        answersData?.answers &&
        answersData.answers.length > 0 && (
          <AnswersList answers={answersData.answers} />
        )}
    </div>
  );
};

export default ResultsPage;
