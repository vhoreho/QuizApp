import { QuestionType } from "@/lib/types";
import { QuestionFormState } from "./types";
import { QUESTION_TYPE_CONFIG } from "@/lib/constants";

export const createQuestionHandlers = (
  questions: QuestionFormState[],
  setQuestions: React.Dispatch<React.SetStateAction<QuestionFormState[]>>,
  setCurrentQuestionIndex: React.Dispatch<React.SetStateAction<number>>
) => {
  // Handler for deleting a question
  const handleDeleteQuestion = (index: number) => {
    // Create deep copy of questions array and remove question at index
    const updatedQuestions = questions.filter((_, i) => i !== index);

    setQuestions(updatedQuestions);
    if (index >= updatedQuestions.length) {
      setCurrentQuestionIndex(updatedQuestions.length - 1);
    }
  };

  // Handler for changing a question's text or correctAnswer
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

  // Handler for changing a question's option
  const handleOptionChange = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const updatedQuestions = [...questions];
    // Create a copy of the options array
    const updatedOptions = [...updatedQuestions[questionIndex].options];
    updatedOptions[optionIndex] = value;

    // Update the question with the new options array
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      options: updatedOptions,
    };

    setQuestions(updatedQuestions);
  };

  // Handler for changing a question's type
  const handleQuestionTypeChange = (
    questionIndex: number,
    value: QuestionType
  ) => {
    const updatedQuestions = [...questions];

    // Create completely new arrays for options
    let newOptions: string[] = [];

    // Copy values from configuration, creating a new array
    const configOptions = QUESTION_TYPE_CONFIG[value].defaultOptions;
    for (let i = 0; i < configOptions.length; i++) {
      newOptions.push(String(configOptions[i]));
    }

    // Create a new question object
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      type: value,
      // Use new arrays and objects without shared references
      options: newOptions,
      correctAnswer: "",
      correctAnswers: [],
      matchingPairs: {},
    };

    setQuestions(updatedQuestions);
  };

  // Handler for adding an option to a question
  const handleAddOption = (questionIndex: number) => {
    const newQuestions = [...questions];
    const question = { ...newQuestions[questionIndex] };

    // Create a new options array with an added empty option
    question.options = [...question.options, ""];

    // Update the question in the array
    newQuestions[questionIndex] = question;

    // Set the new questions array
    setQuestions(newQuestions);
  };

  // Handler for changing a single-choice question's correct answer
  const handleCorrectAnswerChange = (questionIndex: number, option: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      correctAnswer: option,
    };
    setQuestions(updatedQuestions);
  };

  // Handler for toggling a multiple-choice question's correct answers
  const handleCorrectAnswersChange = (questionIndex: number, option: string) => {
    const updatedQuestions = [...questions];
    const correctAnswers = updatedQuestions[questionIndex].correctAnswers || [];

    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      correctAnswers: correctAnswers.includes(option)
        ? correctAnswers.filter((a) => a !== option)
        : [...correctAnswers, option],
    };

    setQuestions(updatedQuestions);
  };

  // Handler for changing a matching pair's value
  const handleMatchingPairChange = (questionIndex: number, key: string, value: string) => {
    const updatedQuestions = [...questions];
    const newMatchingPairs = {
      ...(updatedQuestions[questionIndex].matchingPairs || {}),
    };
    newMatchingPairs[key] = value;

    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      matchingPairs: newMatchingPairs,
    };
    setQuestions(updatedQuestions);
  };

  // Handler for changing a matching pair's key
  const handleKeyChange = (questionIndex: number, pairIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    const newOptions = [...updatedQuestions[questionIndex].options];
    newOptions[pairIndex] = value;

    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      options: newOptions,
    };
    setQuestions(updatedQuestions);
  };

  return {
    handleDeleteQuestion,
    handleQuestionChange,
    handleOptionChange,
    handleQuestionTypeChange,
    handleAddOption,
    handleCorrectAnswerChange,
    handleCorrectAnswersChange,
    handleMatchingPairChange,
    handleKeyChange,
  };
}; 