import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { QuizForm } from "@/components/quiz/QuizForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { teacherApi } from "../api/teacher";
import { QuizCategory } from "@/lib/types";
import * as z from "zod";

const quizFormSchema = z.object({
  title: z.string().min(1, "Название теста обязательно"),
  description: z.string().min(1, "Описание теста обязательно"),
  category: z.nativeEnum(QuizCategory, {
    required_error: "Выберите категорию теста",
  }),
  timeLimit: z.string().optional(),
  passingScore: z.string().optional(),
});

type QuizFormValues = z.infer<typeof quizFormSchema>;

export default function CreateQuizPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values: QuizFormValues) => {
    try {
      setIsLoading(true);
      const quizData = {
        title: values.title,
        description: values.description,
        category: values.category,
        timeLimit: values.timeLimit ? parseInt(values.timeLimit) : undefined,
        passingScore: values.passingScore
          ? parseInt(values.passingScore)
          : undefined,
      };

      const response = await teacherApi.createQuiz(quizData);
      toast({
        title: "Успех",
        description: "Тест успешно создан",
      });
      navigate(`/edit-quiz/${response.id}`);
    } catch (error) {
      console.error("Error creating quiz:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать тест",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Создание нового теста</CardTitle>
        </CardHeader>
        <CardContent>
          <QuizForm onSubmit={handleSubmit} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
