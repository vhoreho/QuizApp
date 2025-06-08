import { useQuery } from "@tanstack/react-query";
import { studentApi } from "@/api/quizApi";

// Хук для получения ответов пользователя по ID результата
export const useResultAnswers = (resultId: number | undefined) => {
  return useQuery({
    queryKey: ["resultAnswers", resultId],
    queryFn: () => (resultId ? studentApi.getResultAnswers(resultId) : null),
    enabled: !!resultId,
  });
}; 