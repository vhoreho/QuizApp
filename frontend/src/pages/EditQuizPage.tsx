import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { quizFormSchema, QuizFormValues } from "@/lib/schemas";
import { Quiz, UserRole, Question, QuestionType } from "@/lib/types";
import { authApi } from "@/api/auth";
import { toast } from "@/components/ui/use-toast";
import {
  useTeacherQuizById,
  useAdminQuizById,
  useTeacherUpdateQuiz,
  useUpdateQuiz,
  useTeacherUpdateQuestion,
  useUpdateQuestion,
  useTeacherDeleteQuestion,
  useDeleteQuestion,
} from "@/hooks/queries/useQuizzes";
import {
  PAGE_TITLES,
  ROUTES,
  MESSAGES,
  QUESTION_TYPE_CONFIG,
} from "@/lib/constants";
import { UpdateQuizDto } from "@/api/quizApi";
import QuestionEditor from "@/components/quiz/QuestionEditor";
import { adminApi, teacherApi } from "@/api/quizApi";

const EditQuizPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const quizId = parseInt(id || "0");
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [activeTab, setActiveTab] = useState<string>("basic");
  const [questions, setQuestions] = useState<Question[]>([]);

  // Fetch user role
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const user = await authApi.getProfile();
        setUserRole(user.role);
      } catch (error) {
        console.error("Error fetching user:", error);
        navigate(ROUTES.LOGIN);
      }
    };

    fetchUserRole();
  }, [navigate]);

  // Fetch quiz data based on user role
  const {
    data: teacherQuiz,
    isLoading: isTeacherQuizLoading,
    refetch: refetchTeacherQuiz,
  } = useTeacherQuizById(quizId);

  const {
    data: adminQuiz,
    isLoading: isAdminQuizLoading,
    refetch: refetchAdminQuiz,
  } = useAdminQuizById(quizId);

  const quiz = userRole === UserRole.ADMIN ? adminQuiz : teacherQuiz;
  const isLoading =
    userRole === UserRole.ADMIN ? isAdminQuizLoading : isTeacherQuizLoading;

  // Set questions when quiz data is loaded
  useEffect(() => {
    if (quiz && quiz.questions) {
      setQuestions(quiz.questions);
    }
  }, [quiz]);

  // Mutations for updating quiz
  const teacherUpdateQuizMutation = useTeacherUpdateQuiz();
  const adminUpdateQuizMutation = useUpdateQuiz();

  // Mutations для обновления вопросов
  const teacherUpdateQuestionMutation = useTeacherUpdateQuestion();
  const adminUpdateQuestionMutation = useUpdateQuestion();
  const teacherDeleteQuestionMutation = useTeacherDeleteQuestion();
  const adminDeleteQuestionMutation = useDeleteQuestion();

  // Quiz form
  const quizForm = useForm<QuizFormValues>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: {
      title: "",
      description: "",
    },
    values: quiz
      ? {
          title: quiz.title,
          description: quiz.description,
        }
      : undefined,
  });

  useEffect(() => {
    if (quiz) {
      quizForm.reset({
        title: quiz.title,
        description: quiz.description,
      });
    }
  }, [quiz, quizForm]);

  const onSubmit = (data: QuizFormValues) => {
    const updateQuizDto: UpdateQuizDto = {
      title: data.title,
      description: data.description,
    };

    const mutation =
      userRole === UserRole.ADMIN
        ? adminUpdateQuizMutation
        : teacherUpdateQuizMutation;

    mutation.mutate(
      { id: quizId, updateQuizDto },
      {
        onSuccess: () => {
          toast({
            title: "Успех",
            description: MESSAGES.SUCCESS.QUIZ_UPDATED,
          });
        },
        onError: (error) => {
          console.error("Error updating quiz:", error);
          toast({
            variant: "destructive",
            title: "Ошибка",
            description: MESSAGES.ERRORS.UPDATE_QUIZ,
          });
        },
      }
    );
  };

  // Handler for saving updated questions
  const handleSaveQuestions = async () => {
    // Переменные для отслеживания прогресса
    let totalQuestions = questions.length;
    let processedQuestions = 0;
    let successCount = 0;
    let errorCount = 0;

    // Определяем, какие методы использовать в зависимости от роли пользователя
    const updateQuestionMutation =
      userRole === UserRole.ADMIN
        ? adminUpdateQuestionMutation
        : teacherUpdateQuestionMutation;

    const deleteQuestionMutation =
      userRole === UserRole.ADMIN
        ? adminDeleteQuestionMutation
        : teacherDeleteQuestionMutation;

    // Получаем вопросы из оригинального теста (с сервера)
    const originalQuestions = quiz?.questions || [];

    try {
      // 1. Обработка существующих вопросов (обновление или удаление)
      const existingQuestions = questions.filter((q) => q.id > 0);
      const existingQuestionIds = existingQuestions.map((q) => q.id);

      // Находим вопросы, которые нужно удалить (присутствуют в оригинальном списке, но отсутствуют в текущем)
      const deletedQuestions = originalQuestions
        .filter((q) => !existingQuestionIds.includes(q.id))
        .map((q) => q.id);

      // Удаляем вопросы, которых больше нет в списке
      for (const questionId of deletedQuestions) {
        await deleteQuestionMutation.mutateAsync(questionId);
        processedQuestions++;
        successCount++;
      }

      // 2. Обновляем существующие вопросы
      for (const question of existingQuestions) {
        // Подготавливаем данные в зависимости от типа вопроса
        const updateQuestionDto: any = {
          text: question.text,
          type: question.type,
          options: question.options,
          points: question.points,
          order: question.order,
        };

        // Добавляем правильный ответ в зависимости от типа вопроса
        if (
          question.type === QuestionType.SINGLE_CHOICE ||
          question.type === QuestionType.TRUE_FALSE
        ) {
          // Для вопросов с одним ответом берем первый элемент из массива correctAnswers
          updateQuestionDto.correctAnswer = question.correctAnswers?.[0] || "";
        } else if (question.type === QuestionType.MULTIPLE_CHOICE) {
          // Для вопросов с множественным выбором используем массив correctAnswers
          updateQuestionDto.correctAnswers = question.correctAnswers || [];
        } else if (question.type === QuestionType.MATCHING) {
          // Для вопросов на соответствие используем объект matchingPairs
          updateQuestionDto.matchingPairs = question.matchingPairs || {};
        }

        try {
          await updateQuestionMutation.mutateAsync({
            id: question.id,
            updateQuestionDto,
          });
          successCount++;
        } catch (error) {
          console.error(`Error updating question ${question.id}:`, error);
          errorCount++;
        }

        processedQuestions++;
      }

      // 3. Добавляем новые вопросы
      const newQuestions = questions.filter((q) => q.id < 0);

      for (const question of newQuestions) {
        // Подготавливаем данные в зависимости от типа вопроса
        const createQuestionDto: any = {
          text: question.text,
          type: question.type,
          options: question.options,
          points: question.points,
          order: question.order,
          quizId: quizId,
        };

        // Добавляем правильный ответ в зависимости от типа вопроса
        if (
          question.type === QuestionType.SINGLE_CHOICE ||
          question.type === QuestionType.TRUE_FALSE
        ) {
          // Для вопросов с одним ответом берем первый элемент из массива correctAnswers
          createQuestionDto.correctAnswer = question.correctAnswers?.[0] || "";
        } else if (question.type === QuestionType.MULTIPLE_CHOICE) {
          // Для вопросов с множественным выбором используем массив correctAnswers
          createQuestionDto.correctAnswers = question.correctAnswers || [];
        } else if (question.type === QuestionType.MATCHING) {
          // Для вопросов на соответствие используем объект matchingPairs
          createQuestionDto.matchingPairs = question.matchingPairs || {};
        }

        const addQuestionApi =
          userRole === UserRole.ADMIN
            ? adminApi.addQuestion
            : teacherApi.addQuestion;

        try {
          await addQuestionApi(quizId, createQuestionDto);
          successCount++;
        } catch (error) {
          console.error("Error adding new question:", error);
          errorCount++;
        }

        processedQuestions++;
      }

      // Обновляем данные после всех изменений
      if (userRole === UserRole.ADMIN) {
        // Запрашиваем обновленные данные
        await refetchAdminQuiz();
      } else {
        await refetchTeacherQuiz();
      }

      if (errorCount > 0) {
        toast({
          title: "Частичный успех",
          description: `Обновлено ${successCount} из ${totalQuestions} вопросов. ${errorCount} вопросов не удалось обновить.`,
          variant: "default",
        });
      } else {
        toast({
          title: "Успех",
          description: "Вопросы успешно обновлены",
        });
      }
    } catch (error) {
      console.error("Error saving questions:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description:
          "Не удалось сохранить вопросы. Пожалуйста, попробуйте снова.",
      });
    }
  };

  // Handler for question update
  const handleQuestionUpdate = (updatedQuestion: Question, index: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = updatedQuestion;
    setQuestions(updatedQuestions);
  };

  // Handler for question delete
  const handleQuestionDelete = (index: number) => {
    if (window.confirm("Вы уверены, что хотите удалить этот вопрос?")) {
      const updatedQuestions = [...questions];
      updatedQuestions.splice(index, 1);
      setQuestions(updatedQuestions);
    }
  };

  // Handler for adding a new question
  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: Math.floor(Math.random() * -1000), // Временный отрицательный ID для новых вопросов
      text: "",
      type: QuestionType.SINGLE_CHOICE,
      options: [
        ...QUESTION_TYPE_CONFIG[QuestionType.SINGLE_CHOICE].defaultOptions,
      ],
      correctAnswers: [],
      quizId: quizId,
      points: 1,
      order: questions.length,
    };

    setQuestions([...questions, newQuestion]);
  };

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  if (!quiz) {
    return <div>Тест не найден</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          {PAGE_TITLES.EDIT_QUIZ}
        </h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="basic">Основная информация</TabsTrigger>
          <TabsTrigger value="questions">
            Вопросы ({questions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>{MESSAGES.QUIZ_EDITING.QUIZ_INFO_TITLE}</CardTitle>
              <CardDescription>
                {MESSAGES.QUIZ_EDITING.QUIZ_INFO_DESCRIPTION}
              </CardDescription>
            </CardHeader>
            <Form {...quizForm}>
              <form onSubmit={quizForm.handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={quizForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Название</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={
                              MESSAGES.QUIZ_EDITING.QUIZ_TITLE_PLACEHOLDER
                            }
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={quizForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Описание</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={
                              MESSAGES.QUIZ_EDITING.QUIZ_DESCRIPTION_PLACEHOLDER
                            }
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/teacher/quizzes")}
                  >
                    {MESSAGES.QUIZ_EDITING.CANCEL_BUTTON}
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      teacherUpdateQuizMutation.isPending ||
                      adminUpdateQuizMutation.isPending
                    }
                  >
                    {teacherUpdateQuizMutation.isPending ||
                    adminUpdateQuizMutation.isPending
                      ? MESSAGES.QUIZ_EDITING.SAVING_BUTTON
                      : MESSAGES.QUIZ_EDITING.SAVE_BUTTON}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>

        <TabsContent value="questions">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Редактирование вопросов</CardTitle>
                    <CardDescription>
                      Настройте вопросы и ответы для вашего теста
                    </CardDescription>
                  </div>
                  <Button onClick={handleAddQuestion}>Добавить вопрос</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {questions.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                      У этого теста пока нет вопросов. Нажмите "Добавить
                      вопрос", чтобы создать первый вопрос.
                    </div>
                  ) : (
                    questions.map((question, index) => (
                      <QuestionEditor
                        key={question.id || index}
                        question={question}
                        index={index}
                        onUpdate={(updatedQuestion) =>
                          handleQuestionUpdate(updatedQuestion, index)
                        }
                        onDelete={() => handleQuestionDelete(index)}
                      />
                    ))
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <div className="w-full flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/teacher/quizzes")}
                  >
                    Отмена
                  </Button>
                  <Button onClick={handleSaveQuestions}>
                    Сохранить вопросы
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EditQuizPage;
