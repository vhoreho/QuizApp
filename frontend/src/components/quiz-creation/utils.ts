import { QUESTION_TYPE_CONFIG } from "@/lib/constants";
import { QuestionType } from "@/lib/types";
import { QuestionFormState } from "./types";
import { CreateQuestionDto } from "@/api/quizApi";

// Function to create a default question with proper structure to avoid reference problems
export const createDefaultQuestion = (order: number = 0): QuestionFormState => {
  // Create new arrays for defaultOptions to avoid reference issues
  let defaultOptions: string[] = [];

  // Copy values from configuration, creating a new array
  const configOptions = QUESTION_TYPE_CONFIG[QuestionType.SINGLE_CHOICE].defaultOptions;
  for (let i = 0; i < configOptions.length; i++) {
    defaultOptions.push(String(configOptions[i]));
  }

  // Create completely new objects and arrays for each question
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

// Function to validate questions
export const validateQuestions = (questions: QuestionFormState[]): boolean => {
  return questions.every((q) => {
    // Basic check - all questions must have text
    if (!q.text) return false;

    // Checks depending on question type
    switch (q.type) {
      case QuestionType.SINGLE_CHOICE:
      case QuestionType.TRUE_FALSE:
        // All options must be filled and a correct answer must be selected
        return q.options.every((opt) => opt) && q.options.includes(q.correctAnswer);

      case QuestionType.MULTIPLE_CHOICE:
        // All options must be filled and at least one correct answer must be selected
        return q.options.every((opt) => opt) && (q.correctAnswers?.length || 0) > 0;

      case QuestionType.MATCHING:
        // All key-value pairs must be filled
        return (
          q.options.every((key) => key) &&
          q.options.every((key) => !!q.matchingPairs?.[key])
        );

      default:
        return false;
    }
  });
};

// Function to prepare questions for submission
export const prepareQuestionsForSubmission = (questions: QuestionFormState[]): CreateQuestionDto[] => {
  return questions.map((question, index) => {
    const questionDto: CreateQuestionDto = {
      text: question.text,
      points: question.points,
      order: index,
      type: question.type,
      quizId: -1, // Используем временный quizId (будет перезаписан на сервере)
    };

    // Add type-specific fields
    switch (question.type) {
      case QuestionType.SINGLE_CHOICE:
      case QuestionType.TRUE_FALSE:
        questionDto.options = question.options;
        questionDto.correctAnswer = question.correctAnswer;
        break;
      case QuestionType.MULTIPLE_CHOICE:
        questionDto.options = question.options;
        questionDto.correctAnswers = question.correctAnswers || [];
        break;
      case QuestionType.MATCHING:
        questionDto.options = question.options;
        questionDto.matchingPairs = question.matchingPairs || {};
        break;
    }

    return questionDto;
  });
}; 