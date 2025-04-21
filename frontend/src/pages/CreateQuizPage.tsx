import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
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
import {
  teacherApi,
  adminApi,
  CreateQuizDto,
  CreateQuestionDto,
} from "@/api/quizApi";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { quizFormSchema, QuizFormValues } from "@/lib/schemas";
import { Label } from "@/components/ui/label";
import { Quiz, QuestionType, UserRole } from "@/lib/types";
import { authApi } from "@/api/auth";
import { toast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CREATE_QUIZ_STEPS,
  QUESTION_TYPE_CONFIG,
  MESSAGES,
  PAGE_TITLES,
  ROUTES,
} from "@/lib/constants";

interface QuestionFormState {
  text: string;
  options: string[];
  correctAnswer: string;
  correctAnswers?: string[];
  matchingPairs?: { [key: string]: string };
  points: number;
  order: number;
  type: QuestionType;
}

// Функция для создания пустого вопроса с правильной структурой для избегания проблем с ссылками
const createDefaultQuestion = (order: number = 0): QuestionFormState => {
  // Каждый раз создаем новые массивы для defaultOptions, чтобы избежать проблем с ссылками
  let defaultOptions: string[] = [];

  // Копируем значения из конфигурации, создавая новый массив
  const configOptions =
    QUESTION_TYPE_CONFIG[QuestionType.SINGLE_CHOICE].defaultOptions;
  for (let i = 0; i < configOptions.length; i++) {
    defaultOptions.push(String(configOptions[i]));
  }

  // Создаем абсолютно новые объекты и массивы для каждого вопроса
  return {
    text: "",
    options: defaultOptions,
    correctAnswer: "",
    correctAnswers: [],
    matchingPairs: {},
    points: 1,
    order,
    type: QuestionType.SINGLE_CHOICE,
  };
};

const CreateQuizPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<number>(
    CREATE_QUIZ_STEPS.QUIZ_INFO
  );
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [questions, setQuestions] = useState<QuestionFormState[]>(() => {
    // Создаем начальный массив с одним вопросом, гарантируя что это новый объект
    return [createDefaultQuestion(0)];
  });

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

  // Quiz form (step 1)
  const quizForm = useForm<QuizFormValues>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  // Questions form (step 2)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const createQuizMutation = useMutation({
    mutationFn: (data: CreateQuizDto) => {
      // Use adminApi for admins, teacherApi for teachers
      if (userRole === UserRole.ADMIN) {
        return adminApi.createQuiz(data);
      } else {
        return teacherApi.createQuiz(data);
      }
    },
    onSuccess: (quiz: Quiz) => {
      // After creating the quiz, create all the questions
      createQuestionsSequentially(quiz.id, 0);
    },
    onError: (error) => {
      console.error("Error creating quiz:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: MESSAGES.ERRORS.CREATE_QUIZ,
      });
    },
  });

  const createQuestionMutation = useMutation({
    mutationFn: (params: {
      quizId: number;
      questionData: CreateQuestionDto;
    }) => {
      // Use adminApi for admins, teacherApi for teachers
      if (userRole === UserRole.ADMIN) {
        return adminApi.addQuestion(params.quizId, params.questionData);
      } else {
        return teacherApi.addQuestion(params.quizId, params.questionData);
      }
    },
    onError: (error) => {
      console.error("Error creating question:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: MESSAGES.ERRORS.CREATE_QUESTION,
      });
    },
  });

  const createQuestionsSequentially = async (quizId: number, index: number) => {
    if (index >= questions.length) {
      // All questions have been created, go back to home
      navigate(ROUTES.HOME);
      toast({
        title: "Успех",
        description: MESSAGES.SUCCESS.QUIZ_CREATED,
      });
      return;
    }

    try {
      const questionData: CreateQuestionDto = {
        text: questions[index].text,
        points: questions[index].points,
        order: index,
        type: questions[index].type,
        quizId: quizId,
      };

      // Подготовка данных в зависимости от типа вопроса
      switch (questions[index].type) {
        case QuestionType.SINGLE_CHOICE:
        case QuestionType.TRUE_FALSE:
          questionData.options = questions[index].options;
          questionData.correctAnswer = questions[index].correctAnswer;
          break;
        case QuestionType.MULTIPLE_CHOICE:
          questionData.options = questions[index].options;
          questionData.correctAnswers = questions[index].correctAnswers || [];
          break;
        case QuestionType.MATCHING:
          questionData.options = questions[index].options;
          questionData.matchingPairs = questions[index].matchingPairs || {};
          break;
      }

      await createQuestionMutation.mutateAsync({
        quizId: quizId,
        questionData: questionData,
      });

      // Create the next question
      createQuestionsSequentially(quizId, index + 1);
    } catch (error) {
      console.error("Error creating question:", error);
    }
  };

  const handleAddQuestion = () => {
    // Создаем новый вопрос с текущей длиной массива вопросов как порядковым номером
    const newQuestion = createDefaultQuestion(questions.length);

    // Создаем новый массив вопросов, добавляя новый вопрос
    const newQuestions = [...questions, newQuestion];

    // Обновляем состояние
    setQuestions(newQuestions);

    // Переключаемся на новый вопрос
    setCurrentQuestionIndex(questions.length);
  };

  const handleQuestionChange = (
    index: number,
    field: keyof QuestionFormState,
    value: string
  ) => {
    const updatedQuestions = [...questions];
    if (field === "text" || field === "correctAnswer") {
      updatedQuestions[index] = {
        ...updatedQuestions[index],
        [field]: value,
      };
    }
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const updatedQuestions = [...questions];
    // Создаем копию массива опций
    const updatedOptions = [...updatedQuestions[questionIndex].options];
    updatedOptions[optionIndex] = value;

    // Обновляем вопрос с новым массивом опций
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      options: updatedOptions,
    };

    setQuestions(updatedQuestions);
  };

  const onQuizFormSubmit = () => {
    // Move to the questions step
    setCurrentStep(CREATE_QUIZ_STEPS.QUESTIONS);
  };

  // Функция для проверки валидности вопросов
  const validateQuestions = (questions: QuestionFormState[]): boolean => {
    return questions.every((q) => {
      // Базовая проверка - у всех вопросов должен быть текст
      if (!q.text) return false;

      // Проверки в зависимости от типа вопроса
      switch (q.type) {
        case QuestionType.SINGLE_CHOICE:
        case QuestionType.TRUE_FALSE:
          // Все варианты должны быть заполнены и должен быть выбран правильный ответ
          return (
            q.options.every((opt) => opt) && q.options.includes(q.correctAnswer)
          );

        case QuestionType.MULTIPLE_CHOICE:
          // Все варианты должны быть заполнены и должен быть выбран хотя бы один правильный ответ
          return (
            q.options.every((opt) => opt) && (q.correctAnswers?.length || 0) > 0
          );

        case QuestionType.MATCHING:
          // Все пары ключ-значение должны быть заполнены
          return (
            q.options.every((key) => key) &&
            q.options.every((key) => !!q.matchingPairs?.[key])
          );

        default:
          return false;
      }
    });
  };

  const handleQuestionsSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const areQuestionsValid = validateQuestions(questions);

    if (areQuestionsValid) {
      // Submit the quiz with form data
      createQuizMutation.mutate({
        title: quizForm.getValues().title,
        description: quizForm.getValues().description,
        isPublished: true,
      });
    } else {
      alert(MESSAGES.ERRORS.INVALID_QUESTIONS);
    }
  };

  const isSubmitting =
    createQuizMutation.isPending || createQuestionMutation.isPending;

  const questionsForm = useForm({
    defaultValues: {
      questions: [],
    },
  });

  const handleQuestionTypeChange = (
    questionIndex: number,
    value: QuestionType
  ) => {
    const updatedQuestions = [...questions];

    // Создаем полностью новые массивы для опций
    let newOptions: string[] = [];

    // Копируем значения из конфигурации, создавая новый массив
    const configOptions = QUESTION_TYPE_CONFIG[value].defaultOptions;
    for (let i = 0; i < configOptions.length; i++) {
      newOptions.push(String(configOptions[i]));
    }

    // Создаем новый объект вопроса
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      type: value,
      // Используем новые массивы и объекты без общих ссылок
      options: newOptions,
      correctAnswer: "",
      correctAnswers: [],
      matchingPairs: {},
    };

    setQuestions(updatedQuestions);
  };

  // Функция для добавления опции к вопросу
  const handleAddOption = (questionIndex: number) => {
    const newQuestions = [...questions];
    const question = { ...newQuestions[questionIndex] };

    // Создаем новый массив опций с добавленной пустой опцией
    question.options = [...question.options, ""];

    // Обновляем вопрос в массиве
    newQuestions[questionIndex] = question;

    // Устанавливаем новый массив вопросов
    setQuestions(newQuestions);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          {PAGE_TITLES.CREATE_QUIZ}
        </h1>
      </div>

      {currentStep === CREATE_QUIZ_STEPS.QUIZ_INFO ? (
        <Card>
          <CardHeader>
            <CardTitle>{MESSAGES.QUIZ_CREATION.QUIZ_INFO_TITLE}</CardTitle>
            <CardDescription>
              {MESSAGES.QUIZ_CREATION.QUIZ_INFO_DESCRIPTION}
            </CardDescription>
          </CardHeader>
          <Form {...quizForm}>
            <form onSubmit={quizForm.handleSubmit(onQuizFormSubmit)}>
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
                            MESSAGES.QUIZ_CREATION.QUIZ_TITLE_PLACEHOLDER
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
                        <Input
                          placeholder={
                            MESSAGES.QUIZ_CREATION.QUIZ_DESCRIPTION_PLACEHOLDER
                          }
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit">
                  {MESSAGES.QUIZ_CREATION.NEXT_BUTTON}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{MESSAGES.QUIZ_CREATION.QUESTIONS_TITLE}</CardTitle>
              <CardDescription>
                {MESSAGES.QUIZ_CREATION.QUESTIONS_DESCRIPTION}
              </CardDescription>
            </CardHeader>
            <Form {...questionsForm}>
              <form onSubmit={handleQuestionsSubmit}>
                <CardContent className="space-y-6">
                  {questions.map((question, qIndex) => (
                    <div
                      key={qIndex}
                      className="space-y-4 border-b pb-6 last:border-0"
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">
                          Вопрос {qIndex + 1}
                        </h3>
                        {questions.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            type="button"
                            onClick={() => {
                              // Создаем глубокую копию массива вопросов и удаляем вопрос по индексу
                              const updatedQuestions = questions.filter(
                                (_, index) => index !== qIndex
                              );

                              setQuestions(updatedQuestions);
                              if (
                                currentQuestionIndex >= updatedQuestions.length
                              ) {
                                setCurrentQuestionIndex(
                                  updatedQuestions.length - 1
                                );
                              }
                            }}
                          >
                            {MESSAGES.QUIZ_CREATION.DELETE_QUESTION_BUTTON}
                          </Button>
                        )}
                      </div>
                      <div>
                        <Label
                          htmlFor={`question-${qIndex}-type`}
                          className="mb-1 block"
                        >
                          {MESSAGES.QUESTION_TYPES.TYPE_LABEL}
                        </Label>
                        <Select
                          value={question.type}
                          onValueChange={(value) =>
                            handleQuestionTypeChange(
                              qIndex,
                              value as QuestionType
                            )
                          }
                        >
                          <SelectTrigger id={`question-${qIndex}-type`}>
                            <SelectValue
                              placeholder={
                                MESSAGES.QUESTION_TYPES.TYPE_PLACEHOLDER
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(QUESTION_TYPE_CONFIG).map(
                              ([type, config]) => (
                                <SelectItem key={type} value={type}>
                                  {config.label}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor={`question-${qIndex}`}>
                          Текст вопроса
                        </Label>
                        <Input
                          id={`question-${qIndex}`}
                          placeholder={
                            MESSAGES.QUIZ_CREATION.QUESTION_TEXT_PLACEHOLDER
                          }
                          value={question.text}
                          onChange={(e) =>
                            handleQuestionChange(qIndex, "text", e.target.value)
                          }
                          className="mt-1"
                        />
                      </div>
                      <div className="space-y-2">
                        {(question.type === QuestionType.SINGLE_CHOICE ||
                          question.type === QuestionType.MULTIPLE_CHOICE ||
                          question.type === QuestionType.TRUE_FALSE) && (
                          <>
                            {question.options.map((option, oIndex) => (
                              <div
                                key={oIndex}
                                className="flex items-center space-x-2"
                              >
                                <Input
                                  placeholder={MESSAGES.QUESTION_TYPES.OPTION_PLACEHOLDER(
                                    oIndex
                                  )}
                                  value={option}
                                  onChange={(e) =>
                                    handleOptionChange(
                                      qIndex,
                                      oIndex,
                                      e.target.value
                                    )
                                  }
                                />
                                {question.type === QuestionType.SINGLE_CHOICE ||
                                question.type === QuestionType.TRUE_FALSE ? (
                                  // Кнопка для одиночного выбора
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const updatedQuestions = [...questions];
                                      updatedQuestions[qIndex] = {
                                        ...updatedQuestions[qIndex],
                                        correctAnswer: option,
                                      };
                                      setQuestions(updatedQuestions);
                                    }}
                                  >
                                    {question.correctAnswer === option
                                      ? MESSAGES.QUESTION_TYPES
                                          .IS_CORRECT_BUTTON
                                      : MESSAGES.QUESTION_TYPES
                                          .MARK_CORRECT_BUTTON}
                                  </Button>
                                ) : (
                                  // Кнопка для множественного выбора
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const updatedQuestions = [...questions];
                                      const correctAnswers =
                                        updatedQuestions[qIndex]
                                          .correctAnswers || [];

                                      updatedQuestions[qIndex] = {
                                        ...updatedQuestions[qIndex],
                                        correctAnswers: correctAnswers.includes(
                                          option
                                        )
                                          ? correctAnswers.filter(
                                              (a) => a !== option
                                            )
                                          : [...correctAnswers, option],
                                      };

                                      setQuestions(updatedQuestions);
                                    }}
                                  >
                                    {question.correctAnswers?.includes(option)
                                      ? MESSAGES.QUESTION_TYPES
                                          .IS_SELECTED_BUTTON
                                      : MESSAGES.QUESTION_TYPES.SELECT_BUTTON}
                                  </Button>
                                )}
                              </div>
                            ))}
                            {question.type !== QuestionType.TRUE_FALSE &&
                              QUESTION_TYPE_CONFIG[question.type]
                                .canAddOptions && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAddOption(qIndex)}
                                >
                                  {MESSAGES.QUESTION_TYPES.ADD_OPTION_BUTTON}
                                </Button>
                              )}
                          </>
                        )}

                        {/* Сопоставление */}
                        {question.type === QuestionType.MATCHING && (
                          <>
                            {question.options.map((key, pIndex) => (
                              <div
                                key={pIndex}
                                className="grid grid-cols-2 gap-2"
                              >
                                <div>
                                  <Input
                                    placeholder={MESSAGES.QUESTION_TYPES.KEY_PLACEHOLDER(
                                      pIndex
                                    )}
                                    value={key}
                                    onChange={(e) => {
                                      const updatedQuestions = [...questions];
                                      const newOptions = [
                                        ...updatedQuestions[qIndex].options,
                                      ];
                                      newOptions[pIndex] = e.target.value;

                                      updatedQuestions[qIndex] = {
                                        ...updatedQuestions[qIndex],
                                        options: newOptions,
                                      };
                                      setQuestions(updatedQuestions);
                                    }}
                                  />
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Input
                                    placeholder={MESSAGES.QUESTION_TYPES.VALUE_PLACEHOLDER(
                                      pIndex
                                    )}
                                    value={question.matchingPairs?.[key] || ""}
                                    onChange={(e) => {
                                      const updatedQuestions = [...questions];
                                      const newMatchingPairs = {
                                        ...(updatedQuestions[qIndex]
                                          .matchingPairs || {}),
                                      };
                                      newMatchingPairs[key] = e.target.value;

                                      updatedQuestions[qIndex] = {
                                        ...updatedQuestions[qIndex],
                                        matchingPairs: newMatchingPairs,
                                      };
                                      setQuestions(updatedQuestions);
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddOption(qIndex)}
                            >
                              {MESSAGES.QUESTION_TYPES.ADD_PAIR_BUTTON}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddQuestion}
                  >
                    {MESSAGES.QUIZ_CREATION.ADD_QUESTION_BUTTON}
                  </Button>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(CREATE_QUIZ_STEPS.QUIZ_INFO)}
                  >
                    {MESSAGES.QUIZ_CREATION.BACK_BUTTON}
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !validateQuestions(questions)}
                  >
                    {isSubmitting
                      ? MESSAGES.QUIZ_CREATION.SUBMITTING_BUTTON
                      : MESSAGES.QUIZ_CREATION.SUBMIT_BUTTON}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CreateQuizPage;
