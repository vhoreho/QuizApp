import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { studentApi, SubmitQuizDto } from "@/api/quizApi";
import { submitQuizSchema, SubmitQuizValues } from "@/lib/schemas";

interface QuizAnswer {
  questionId: number;
  selectedAnswer: string;
}

const TakeQuizPage = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<QuizAnswer[]>([]);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);

  const quizIdNumber = quizId ? parseInt(quizId) : 0;

  // Form setup
  const methods = useForm<SubmitQuizValues>({
    resolver: zodResolver(submitQuizSchema),
    defaultValues: {
      quizId: quizIdNumber,
      answers: [],
    },
  });

  const { data: quiz, isLoading: isQuizLoading } = useQuery({
    queryKey: ["quiz", quizId],
    queryFn: () => studentApi.getQuizById(Number(quizId)),
    enabled: !!quizId,
  });

  const { data: questions, isLoading: areQuestionsLoading } = useQuery({
    queryKey: ["questions", quizId],
    queryFn: () => studentApi.getQuizQuestions(Number(quizId)),
    enabled: !!quizId,
  });

  const submitQuizMutation = useMutation({
    mutationFn: (data: SubmitQuizDto) =>
      studentApi.submitQuiz(Number(quizId), data),
    onSuccess: (result) => {
      navigate(`/results/${quizId}`, { state: { result } });
    },
  });

  const isLoading = isQuizLoading || areQuestionsLoading;
  const totalQuestions = questions?.length || 0;
  const currentQuestionData = questions?.[currentQuestion];

  const handleSelectAnswer = (answer: string) => {
    const newAnswers = [...selectedAnswers];

    // Find the index of the answer for the current question
    const existingAnswerIndex = newAnswers.findIndex(
      (a) => a.questionId === currentQuestionData?.id
    );

    // Update or add the answer
    if (existingAnswerIndex !== -1) {
      newAnswers[existingAnswerIndex].selectedAnswer = answer;
    } else if (currentQuestionData) {
      newAnswers.push({
        questionId: currentQuestionData.id,
        selectedAnswer: answer,
      });
    }

    setSelectedAnswers(newAnswers);

    // Update form values
    methods.setValue("answers", newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Open submit dialog on the last question
      setIsSubmitDialogOpen(true);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitQuiz = () => {
    if (quizId && questions) {
      const answeredQuestions = selectedAnswers.length;
      const totalQuestions = questions.length;

      // Check if all questions have been answered
      if (answeredQuestions < totalQuestions) {
        alert(
          `Вы ответили только на ${answeredQuestions} из ${totalQuestions} вопросов.`
        );
        setIsSubmitDialogOpen(false);
        return;
      }

      methods.handleSubmit(
        (data) => {
          submitQuizMutation.mutate({
            answers: data.answers,
          });
        },
        (errors) => {
          console.error("Form errors:", errors);
          alert(
            "Возникла проблема при отправке ваших ответов. Пожалуйста, попробуйте еще раз."
          );
        }
      )();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p>Загрузка викторины...</p>
      </div>
    );
  }

  if (!quiz || !questions || questions.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-destructive">
          Викторина не найдена или не содержит вопросов
        </p>
      </div>
    );
  }

  // Get the selected answer for the current question
  const selectedAnswer = selectedAnswers.find(
    (a) => a.questionId === currentQuestionData?.id
  )?.selectedAnswer;

  return (
    <FormProvider {...methods}>
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">{quiz.title}</h1>
          <div className="text-sm text-muted-foreground">
            Вопрос {currentQuestion + 1} из {totalQuestions}
          </div>
        </div>

        {currentQuestionData && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Вопрос {currentQuestion + 1}</CardTitle>
              <CardDescription>{currentQuestionData.text}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {currentQuestionData.options &&
                  currentQuestionData.options.map((option, index) => (
                    <Button
                      key={index}
                      variant={
                        selectedAnswer === option ? "default" : "outline"
                      }
                      className="justify-start h-auto py-3 px-4 text-left"
                      onClick={() => handleSelectAnswer(option)}
                    >
                      {option}
                    </Button>
                  ))}
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <Button
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestion === 0}
              >
                Назад
              </Button>
              <Button onClick={handleNextQuestion} disabled={!selectedAnswer}>
                {currentQuestion < totalQuestions - 1
                  ? "Далее"
                  : "Проверить и отправить"}
              </Button>
            </CardFooter>
          </Card>
        )}

        <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Отправка викторины</DialogTitle>
              <DialogDescription>
                Вы ответили на {selectedAnswers.length} из {totalQuestions}{" "}
                вопросов. Вы уверены, что хотите отправить ответы?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsSubmitDialogOpen(false)}
              >
                Вернуться
              </Button>
              <Button
                onClick={handleSubmitQuiz}
                disabled={submitQuizMutation.isPending}
              >
                {submitQuizMutation.isPending
                  ? "Отправка..."
                  : "Отправить викторину"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </FormProvider>
  );
};

export default TakeQuizPage;
