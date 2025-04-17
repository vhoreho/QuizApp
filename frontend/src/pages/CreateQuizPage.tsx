import { useState } from "react";
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
import { teacherApi, CreateQuizDto, CreateQuestionDto } from "@/api/quizApi";
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
import { Quiz, QuestionType } from "@/lib/types";

interface QuestionFormState {
  text: string;
  options: string[];
  correctAnswer: string;
  points: number;
  order: number;
  type: QuestionType;
}

const CreateQuizPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [questions, setQuestions] = useState<QuestionFormState[]>([
    {
      text: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      points: 1,
      order: 0,
      type: QuestionType.SINGLE_CHOICE,
    },
  ]);

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
    mutationFn: teacherApi.createQuiz,
    onSuccess: (quiz: Quiz) => {
      // After creating the quiz, create all the questions
      createQuestionsSequentially(quiz.id, 0);
    },
  });

  const createQuestionMutation = useMutation({
    mutationFn: (params: { quizId: number; questionData: CreateQuestionDto }) =>
      teacherApi.addQuestion(params.quizId, params.questionData),
  });

  const createQuestionsSequentially = async (quizId: number, index: number) => {
    if (index >= questions.length) {
      // All questions have been created, go back to home
      navigate("/");
      return;
    }

    try {
      await createQuestionMutation.mutateAsync({
        quizId: quizId,
        questionData: {
          text: questions[index].text,
          options: questions[index].options,
          correctAnswer: questions[index].correctAnswer,
          points: questions[index].points,
          order: index,
          type: questions[index].type,
        },
      });

      // Create the next question
      createQuestionsSequentially(quizId, index + 1);
    } catch (error) {
      console.error("Error creating question:", error);
    }
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: "",
        options: ["", "", "", ""],
        correctAnswer: "",
        points: 1,
        order: questions.length,
        type: QuestionType.SINGLE_CHOICE,
      },
    ]);
    setCurrentQuestionIndex(questions.length);
  };

  const handleQuestionChange = (
    index: number,
    field: keyof QuestionFormState,
    value: string
  ) => {
    const updatedQuestions = [...questions];
    if (field === "text" || field === "correctAnswer") {
      updatedQuestions[index][field] = value;
    }
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(updatedQuestions);
  };

  const onQuizFormSubmit = () => {
    // Move to the questions step
    setCurrentStep(1);
  };

  const handleQuestionsSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate questions before submission
    const areQuestionsValid = questions.every(
      (q) =>
        q.text &&
        q.correctAnswer &&
        q.options.every((option) => option) &&
        q.options.includes(q.correctAnswer)
    );

    if (areQuestionsValid) {
      // Submit the quiz with form data
      createQuizMutation.mutate({
        title: quizForm.getValues().title,
        description: quizForm.getValues().description,
        isPublished: true,
      });
    } else {
      alert(
        "Please fill in all questions with options and mark the correct answers."
      );
    }
  };

  const isSubmitting =
    createQuizMutation.isPending || createQuestionMutation.isPending;

  const areQuestionsValid = questions.every(
    (q) =>
      q.text &&
      q.correctAnswer &&
      q.options.every((option) => option) &&
      q.options.includes(q.correctAnswer)
  );

  const questionsForm = useForm({
    defaultValues: {
      questions: questions,
    },
  });

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-6">
        Создать новую викторину
      </h1>

      {currentStep === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Информация о викторине</CardTitle>
            <CardDescription>
              Введите основные данные для вашей викторины.
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
                          placeholder="Введите название викторины"
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
                          placeholder="Введите описание викторины"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit">Далее: Добавить вопросы</Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Вопросы</CardTitle>
              <CardDescription>
                Добавьте вопросы к вашей викторине.
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
                              const updatedQuestions = [...questions];
                              updatedQuestions.splice(qIndex, 1);
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
                            Удалить
                          </Button>
                        )}
                      </div>
                      <div>
                        <Label htmlFor={`question-${qIndex}`}>
                          Текст вопроса
                        </Label>
                        <Input
                          id={`question-${qIndex}`}
                          placeholder="Введите текст вопроса"
                          value={question.text}
                          onChange={(e) =>
                            handleQuestionChange(qIndex, "text", e.target.value)
                          }
                          className="mt-1"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Варианты ответов</Label>
                        {question.options.map((option, oIndex) => (
                          <div
                            key={oIndex}
                            className="flex items-center space-x-2"
                          >
                            <Input
                              placeholder={`Вариант ${oIndex + 1}`}
                              value={option}
                              onChange={(e) =>
                                handleOptionChange(
                                  qIndex,
                                  oIndex,
                                  e.target.value
                                )
                              }
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const updatedQuestions = [...questions];
                                updatedQuestions[qIndex].correctAnswer = option;
                                setQuestions(updatedQuestions);
                              }}
                            >
                              {question.correctAnswer === option
                                ? "✓ Правильный"
                                : "Сделать правильным"}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddQuestion}
                  >
                    Добавить вопрос
                  </Button>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(0)}
                  >
                    Назад
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !areQuestionsValid}
                  >
                    {isSubmitting ? "Отправка..." : "Создать викторину"}
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
