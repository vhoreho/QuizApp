import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateQuizDto, quizApi } from "@/api/quizApi";
import { quizFormSchema, QuizFormValues } from "@/lib/schemas";
import { Quiz, UserRole } from "@/lib/types";
import { authApi } from "@/api/auth";
import { toast } from "@/components/ui/use-toast";
import {
  CREATE_QUIZ_STEPS,
  MESSAGES,
  PAGE_TITLES,
  ROUTES,
} from "@/lib/constants";
import {
  QuestionFormState,
  QuizInfoForm,
  QuestionsForm,
  createDefaultQuestion,
  createQuestionHandlers,
  prepareQuestionsForSubmission,
  validateQuestions,
} from "@/components/quiz-creation";

const CreateQuizPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<number>(
    CREATE_QUIZ_STEPS.QUIZ_INFO
  );
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [questions, setQuestions] = useState<QuestionFormState[]>(() => {
    // Create initial array with one question, ensuring it's a new object
    return [createDefaultQuestion(0)];
  });

  // Questions form (step 2)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

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

  const createQuizMutation = useMutation({
    mutationFn: (data: CreateQuizDto) => {
      return quizApi.createQuiz(data);
    },
    onSuccess: (quiz: Quiz) => {
      // Quiz with questions created successfully, navigate to home
      navigate(ROUTES.HOME);
      toast({
        title: "Успех",
        description: MESSAGES.SUCCESS.QUIZ_CREATED,
      });
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

  const isSubmitting = createQuizMutation.isPending;

  const questionsForm = useForm({
    defaultValues: {
      questions: [],
    },
  });

  // Create handlers for question manipulation
  const questionHandlers = createQuestionHandlers(
    questions,
    setQuestions,
    setCurrentQuestionIndex
  );

  // Handler for adding a new question
  const handleAddQuestion = () => {
    // Create a new question with the current questions array length as order
    const newQuestion = createDefaultQuestion(questions.length);

    // Create a new questions array, adding the new question
    const newQuestions = [...questions, newQuestion];

    // Update state
    setQuestions(newQuestions);

    // Switch to the new question
    setCurrentQuestionIndex(questions.length);
  };

  // Handler for moving to questions step
  const onQuizFormSubmit = () => {
    // Move to the questions step
    setCurrentStep(CREATE_QUIZ_STEPS.QUESTIONS);
  };

  // Handler for form submission
  const handleQuestionsSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const areQuestionsValid = validateQuestions(questions);

    if (areQuestionsValid) {
      // Prepare questions for submission
      const preparedQuestions = prepareQuestionsForSubmission(questions);

      // Log auth token and quiz data
      const token = localStorage.getItem("token");
      console.log("Auth token:", token ? "Present" : "Missing");
      console.log("User role:", userRole);
      console.log("Questions prepared for submission:", preparedQuestions);

      // Submit the quiz with all questions at once
      createQuizMutation.mutate({
        title: quizForm.getValues().title,
        description: quizForm.getValues().description,
        isPublished: true,
        questions: preparedQuestions,
      });
    } else {
      alert(MESSAGES.ERRORS.INVALID_QUESTIONS);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          {PAGE_TITLES.CREATE_QUIZ}
        </h1>
      </div>

      {currentStep === CREATE_QUIZ_STEPS.QUIZ_INFO ? (
        <QuizInfoForm quizForm={quizForm} onSubmit={onQuizFormSubmit} />
      ) : (
        <div className="space-y-6">
          <QuestionsForm
            questionsForm={questionsForm}
            questions={questions}
            isSubmitting={isSubmitting}
            onBack={() => setCurrentStep(CREATE_QUIZ_STEPS.QUIZ_INFO)}
            onSubmit={handleQuestionsSubmit}
            onAddQuestion={handleAddQuestion}
            validateQuestions={validateQuestions}
            onDeleteQuestion={questionHandlers.handleDeleteQuestion}
            onQuestionChange={questionHandlers.handleQuestionChange}
            onQuestionTypeChange={questionHandlers.handleQuestionTypeChange}
            onOptionChange={questionHandlers.handleOptionChange}
            onAddOption={questionHandlers.handleAddOption}
            onCorrectAnswerChange={questionHandlers.handleCorrectAnswerChange}
            onCorrectAnswersChange={questionHandlers.handleCorrectAnswersChange}
            onMatchingPairChange={questionHandlers.handleMatchingPairChange}
            onKeyChange={questionHandlers.handleKeyChange}
          />
        </div>
      )}
    </div>
  );
};

export default CreateQuizPage;
