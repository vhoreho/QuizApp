import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { studentApi, SubmitQuizDto } from "@/api/quizApi";
import { submitQuizSchema, SubmitQuizValues } from "@/lib/schemas";
import { toast } from "@/components/ui/use-toast";
import { ROUTES, MESSAGES } from "@/lib/constants";
import { Answer, Question } from "@/lib/types";
import { QuestionRenderer } from "@/components/questions/QuestionRenderer";
import { getUserIdFromLocalStorage, checkAuthStatus } from "@/utils/authCheck";
import {
  TimerIcon,
  ReloadIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
  CheckCircledIcon,
  Cross2Icon,
  ExitIcon,
  HomeIcon,
  ClockIcon,
  BookmarkFilledIcon,
  InfoCircledIcon,
  QuestionMarkCircledIcon,
  EyeOpenIcon,
  RocketIcon,
} from "@radix-ui/react-icons";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";

const TakeQuizPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const quizIdNumber = id ? parseInt(id) : 0;

  useEffect(() => {
    if (!id || isNaN(quizIdNumber) || quizIdNumber <= 0) {
      setErrorMessage(
        "Некорректный ID теста. Идентификатор теста должен быть положительным числом."
      );
      toast({
        variant: "destructive",
        title: "Ошибка",
        description:
          "Некорректный ID теста. Пожалуйста, убедитесь, что URL содержит правильный идентификатор теста.",
      });
    }
  }, [id, quizIdNumber]);

  // Form setup
  const methods = useForm<SubmitQuizValues>({
    resolver: zodResolver(submitQuizSchema),
    defaultValues: {
      quizId: quizIdNumber,
      answers: [],
    },
  });

  // Проверяем, проходил ли пользователь тест ранее
  const {
    data: hasTakenQuiz,
    isLoading: isHasTakenQuizLoading,
    error: hasTakenQuizError,
  } = useQuery({
    queryKey: ["hasTakenQuiz", id],
    queryFn: () => studentApi.hasUserTakenQuiz(Number(id)),
    enabled: !!id && !isNaN(quizIdNumber),
  });

  const {
    data: quiz,
    isLoading: isQuizLoading,
    error: quizError,
  } = useQuery({
    queryKey: ["quiz", id],
    queryFn: () => studentApi.getQuizById(Number(id)),
    enabled: !!id && !isNaN(quizIdNumber),
    retry: 1,
  });

  const {
    data: questions,
    isLoading: areQuestionsLoading,
    error: questionsError,
  } = useQuery({
    queryKey: ["questions", id],
    queryFn: () => studentApi.getQuizQuestions(Number(id)),
    enabled: !!id && !isNaN(quizIdNumber) && !hasTakenQuiz,
    retry: 1,
  });

  // Инициализация таймера для теста
  useEffect(() => {
    if (quiz?.timeLimit && quiz.timeLimit > 0) {
      // Устанавливаем начальное значение таймера в минутах
      setTimeRemaining(quiz.timeLimit * 60);

      // Создаем таймер, который будет вычитать по 1 секунде
      const timerId = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null || prev <= 0) {
            // Если время истекло, очищаем таймер и автоматически отправляем тест
            clearInterval(timerId);
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      setTimer(timerId);

      // Очищаем таймер при размонтировании компонента
      return () => {
        clearInterval(timerId);
      };
    }
  }, [quiz]);

  // Форматирование времени для отображения
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Обработка ошибок запросов
  useEffect(() => {
    if (quizError) {
      console.error("Error fetching quiz:", quizError);
      setErrorMessage(MESSAGES.ERRORS.QUIZ_NOT_FOUND);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: MESSAGES.ERRORS.QUIZ_NOT_FOUND,
      });
    }

    if (questionsError) {
      console.error("Error fetching questions:", questionsError);
      setErrorMessage(MESSAGES.ERRORS.LOAD_QUESTIONS_ERROR);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: MESSAGES.ERRORS.LOAD_QUESTIONS_ERROR,
      });
    }

    if (hasTakenQuizError) {
      console.error(
        "Error checking if user has taken quiz:",
        hasTakenQuizError
      );
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось проверить историю прохождения теста.",
      });
    }
  }, [quizError, questionsError, hasTakenQuizError]);

  const submitQuizMutation = useMutation({
    mutationFn: (data: SubmitQuizDto) =>
      studentApi.submitQuiz(Number(id), data),
    onSuccess: (result) => {
      const formattedResult = {
        id: 0,
        quizId: Number(id),
        score: result.score,
        correctAnswers: result.correctAnswers,
        totalQuestions: result.totalQuestions,
      };

      toast({
        title: "Успех",
        description: MESSAGES.SUCCESS.QUIZ_COMPLETED,
      });

      // Очищаем таймер при успешной отправке
      if (timer) {
        clearInterval(timer);
      }

      navigate(ROUTES.QUIZ_RESULTS(Number(id)), {
        state: { result: formattedResult },
      });
    },
    onError: (error: any) => {
      console.error("Error submitting quiz:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description:
          "Не удалось отправить ответы. Пожалуйста, попробуйте снова.",
      });
      setIsSubmitDialogOpen(false);
    },
  });

  const isLoading =
    isQuizLoading || areQuestionsLoading || isHasTakenQuizLoading;
  const totalQuestions = questions?.length || 0;
  const currentQuestionData = questions?.[currentQuestion] as
    | Question
    | undefined;

  // Расчет прогресса прохождения теста
  const calculateProgress = () => {
    return (answers.length / totalQuestions) * 100;
  };

  const handleAnswerSelect = (answer: Answer) => {
    const newAnswers = [...answers];
    const existingAnswerIndex = newAnswers.findIndex(
      (a) => a.questionId === answer.questionId
    );

    if (existingAnswerIndex !== -1) {
      newAnswers[existingAnswerIndex] = answer;
    } else {
      newAnswers.push(answer);
    }

    setAnswers(newAnswers);
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

  const handleSubmitQuiz = async () => {
    if (id && questions) {
      const answeredQuestions = answers.length;
      const totalQuestions = questions.length;

      // Check if all questions have been answered
      if (answeredQuestions < totalQuestions) {
        toast({
          title: "Внимание",
          description: `Вы ответили только на ${answeredQuestions} из ${totalQuestions} вопросов.`,
        });
        setIsSubmitDialogOpen(false);
        return;
      }

      // Check authentication status before submitting
      try {
        const authStatus = await checkAuthStatus();
        if (!authStatus.isAuthenticated) {
          toast({
            variant: "destructive",
            title: "Ошибка аутентификации",
            description: "Ваша сессия истекла. Пожалуйста, войдите снова.",
          });
          navigate(ROUTES.LOGIN);
          return;
        }

        // Get user ID from local storage as a backup
        const userId = getUserIdFromLocalStorage();
        if (!userId) {
          toast({
            variant: "destructive",
            title: "Ошибка аутентификации",
            description:
              "Не удалось определить ID пользователя. Пожалуйста, войдите снова.",
          });
          navigate(ROUTES.LOGIN);
          return;
        }

        console.log("Submitting quiz with user ID:", userId);

        // Отправляем данные с указанием quizId
        submitQuizMutation.mutate({
          quizId: Number(id),
          answers: answers,
        });
      } catch (error) {
        console.error("Error checking auth status:", error);
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Произошла ошибка при проверке аутентификации.",
        });
      }
    }
  };

  const setQuestionCardColor = (index: number) => {
    if (index === currentQuestion) {
      return "bg-primary/10 border-primary/30 dark:border-primary/40";
    }
    const isAnswered = answers.some(
      (a) => a.questionId === questions?.[index]?.id
    );
    return isAnswered
      ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800/30"
      : "bg-muted/30 border-border hover:bg-muted/50";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-primary border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">{MESSAGES.COMMON.LOADING}</p>
        </div>
      </div>
    );
  }

  if (hasTakenQuiz) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-red-50/30 dark:from-background dark:to-red-950/10">
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto border border-red-200 dark:border-red-800/30 bg-white/80 dark:bg-background/80 backdrop-blur-sm shadow-lg">
            <CardHeader className="bg-gradient-to-r from-red-50 to-amber-50 dark:from-red-950/50 dark:to-amber-950/50 border-b border-red-100 dark:border-red-900/30">
              <div className="flex items-center justify-center mb-2">
                <div className="bg-red-100 dark:bg-red-900/50 p-3 rounded-full">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-500 dark:text-red-400" />
                </div>
              </div>
              <CardTitle className="text-center text-red-700 dark:text-red-400">
                Тест уже пройден
              </CardTitle>
              <CardDescription className="text-center">
                Вы уже проходили этот тест. Повторное прохождение запрещено.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-col gap-3 pt-6">
              <Button
                onClick={() => navigate(ROUTES.QUIZ_RESULTS(Number(id)))}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
              >
                <EyeOpenIcon className="mr-2 h-4 w-4" />
                Посмотреть результаты
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(ROUTES.HOME)}
                className="w-full"
              >
                <HomeIcon className="mr-2 h-4 w-4" />
                {MESSAGES.COMMON.GO_HOME}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  if (errorMessage || quizError || questionsError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-red-50/30 dark:from-background dark:to-red-950/10">
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto border border-red-200 dark:border-red-800/30 bg-white/80 dark:bg-background/80 backdrop-blur-sm shadow-lg">
            <CardHeader className="bg-gradient-to-r from-red-50 to-amber-50 dark:from-red-950/50 dark:to-amber-950/50 border-b border-red-100 dark:border-red-900/30">
              <div className="flex items-center justify-center mb-2">
                <div className="bg-red-100 dark:bg-red-900/50 p-3 rounded-full">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-500 dark:text-red-400" />
                </div>
              </div>
              <CardTitle className="text-center text-red-700 dark:text-red-400">
                Ошибка
              </CardTitle>
              <CardDescription className="text-center">
                {errorMessage || MESSAGES.ERRORS.QUIZ_NOT_FOUND}
              </CardDescription>
            </CardHeader>
            <CardFooter className="pt-6">
              <Button onClick={() => navigate(ROUTES.HOME)} className="w-full">
                <HomeIcon className="mr-2 h-4 w-4" />
                {MESSAGES.COMMON.GO_HOME}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  if (!quiz || !questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-amber-50/30 dark:from-background dark:to-amber-950/10">
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto border border-amber-200 dark:border-amber-800/30 bg-white/80 dark:bg-background/80 backdrop-blur-sm shadow-lg">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/50 dark:to-yellow-950/50 border-b border-amber-100 dark:border-amber-900/30">
              <div className="flex items-center justify-center mb-2">
                <div className="bg-amber-100 dark:bg-amber-900/50 p-3 rounded-full">
                  <InfoCircledIcon className="h-6 w-6 text-amber-500 dark:text-amber-400" />
                </div>
              </div>
              <CardTitle className="text-center text-amber-700 dark:text-amber-400">
                Тест не найден
              </CardTitle>
              <CardDescription className="text-center">
                Тест не найден или не содержит вопросов
              </CardDescription>
            </CardHeader>
            <CardFooter className="pt-6">
              <Button
                onClick={() => navigate(ROUTES.HOME)}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
              >
                <HomeIcon className="mr-2 h-4 w-4" />
                {MESSAGES.COMMON.GO_HOME}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  // Get the current answer for the question
  const currentAnswer = answers.find(
    (a) => a.questionId === currentQuestionData?.id
  );

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-blue-50/20 dark:from-background dark:to-blue-950/10">
        <header className="bg-background/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center">
                <div className="bg-primary/10 p-2 rounded-full mr-3">
                  <RocketIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold truncate max-w-md">
                    {quiz.title}
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    {quiz.description && quiz.description.length > 80
                      ? quiz.description.substring(0, 80) + "..."
                      : quiz.description}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-center">
                {timeRemaining !== null && (
                  <div className="flex items-center gap-2 bg-background/80 border border-border px-3 py-1.5 rounded-md">
                    <ClockIcon
                      className={`h-4 w-4 ${
                        timeRemaining < 60
                          ? "text-red-500 animate-pulse"
                          : "text-muted-foreground"
                      }`}
                    />
                    <span
                      className={`font-mono ${
                        timeRemaining < 60 ? "text-red-500 font-bold" : ""
                      }`}
                    >
                      {formatTime(timeRemaining)}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 bg-background/80 border border-border px-3 py-1.5 rounded-md">
                  <BookmarkFilledIcon className="h-4 w-4 text-primary/70" />
                  <span className="font-medium">
                    {currentQuestion + 1}/{totalQuestions}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(ROUTES.HOME)}
                  className="hidden md:flex"
                >
                  <ExitIcon className="h-4 w-4 mr-2" />
                  Выйти
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Боковая панель с вопросами */}
            <div className="md:col-span-1">
              <div className="bg-background/80 backdrop-blur-sm rounded-lg border border-border p-4 shadow-sm sticky top-24">
                <div className="mb-4">
                  <h2 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <QuestionMarkCircledIcon className="h-4 w-4 text-primary" />
                    Вопросы
                  </h2>
                  <Progress value={calculateProgress()} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Отвечено на {answers.length} из {totalQuestions} вопросов
                  </p>
                </div>

                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                  {questions.map((question, index) => (
                    <button
                      key={question.id}
                      onClick={() => setCurrentQuestion(index)}
                      className={`w-full text-left p-2 rounded-md border text-sm
                        transition-all duration-200 ${setQuestionCardColor(
                          index
                        )}`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Вопрос {index + 1}</span>
                        {answers.some((a) => a.questionId === question.id) && (
                          <CheckCircledIcon className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {question.text.length > 30
                          ? question.text.substring(0, 30) + "..."
                          : question.text}
                      </p>
                    </button>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <Button
                    className="w-full"
                    onClick={() => setIsSubmitDialogOpen(true)}
                    disabled={answers.length === 0}
                  >
                    Завершить тест
                  </Button>
                </div>
              </div>
            </div>

            {/* Основной контент с вопросом */}
            <div className="md:col-span-3">
              {currentQuestionData && (
                <Card className="border border-border bg-white/90 dark:bg-background/90 backdrop-blur-sm shadow-md">
                  <CardHeader className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-950/30 dark:to-indigo-950/30 border-b border-border">
                    <div className="flex justify-between items-center">
                      <Badge
                        variant="outline"
                        className="bg-primary/10 text-primary border-primary/20"
                      >
                        Вопрос {currentQuestion + 1} из {totalQuestions}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-700/30"
                      >
                        {currentQuestionData.points}{" "}
                        {currentQuestionData.points === 1
                          ? "балл"
                          : currentQuestionData.points > 1 &&
                            currentQuestionData.points < 5
                          ? "балла"
                          : "баллов"}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl mt-2">
                      {currentQuestionData.text}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="pt-6">
                    <QuestionRenderer
                      question={currentQuestionData}
                      onAnswerSelect={handleAnswerSelect}
                      currentAnswer={currentAnswer}
                      disabled={false}
                    />
                  </CardContent>

                  <CardFooter className="flex justify-between pt-4 border-t border-border bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20">
                    <Button
                      variant="outline"
                      onClick={handlePreviousQuestion}
                      disabled={currentQuestion === 0}
                      className="bg-background/70 hover:bg-background"
                    >
                      <ArrowLeftIcon className="h-4 w-4 mr-2" />
                      {MESSAGES.COMMON.PREVIOUS}
                    </Button>

                    <Button
                      onClick={handleNextQuestion}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {currentQuestion === totalQuestions - 1 ? (
                        <>
                          Завершить
                          <CheckCircledIcon className="h-4 w-4 ml-2" />
                        </>
                      ) : (
                        <>
                          {MESSAGES.COMMON.NEXT}
                          <ArrowRightIcon className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>
          </div>
        </main>

        <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
          <DialogContent className="sm:max-w-md border-border bg-background/95 backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle className="text-center flex items-center justify-center gap-2">
                <CheckCircledIcon className="h-5 w-5 text-primary" />
                Подтвердите отправку
              </DialogTitle>
              <DialogDescription className="text-center pt-2">
                Вы уверены, что хотите отправить ваши ответы? После отправки вы
                не сможете изменить свои ответы.
              </DialogDescription>
            </DialogHeader>

            {answers.length < totalQuestions && (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/30 rounded-md p-3 text-sm">
                <p className="flex items-start gap-2 text-amber-700 dark:text-amber-400">
                  <InfoCircledIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>
                    Вы ответили только на {answers.length} из {totalQuestions}{" "}
                    вопросов. Неотвеченные вопросы будут засчитаны как
                    неправильные.
                  </span>
                </p>
              </div>
            )}

            <DialogFooter className="sm:justify-center gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsSubmitDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                <Cross2Icon className="h-4 w-4 mr-2" />
                {MESSAGES.COMMON.CANCEL_BUTTON}
              </Button>
              <Button
                onClick={handleSubmitQuiz}
                disabled={submitQuizMutation.isPending}
                className="w-full sm:w-auto bg-primary hover:bg-primary/90"
              >
                {submitQuizMutation.isPending ? (
                  <>
                    <ReloadIcon className="h-4 w-4 mr-2 animate-spin" />
                    {MESSAGES.COMMON.LOADING}
                  </>
                ) : (
                  <>
                    <CheckCircledIcon className="h-4 w-4 mr-2" />
                    {MESSAGES.COMMON.SUBMIT_BUTTON}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </FormProvider>
  );
};

export default TakeQuizPage;
