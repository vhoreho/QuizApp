import { Question } from "@/lib/types";
import { QuestionParserResult } from "./types";
import { validateQuestionType, detectQuestionType } from "./utils";

// Function to parse JSON quiz
export const parseJsonQuiz = (content: string): QuestionParserResult => {
  try {
    const parsedData = JSON.parse(content);
    console.log("Parsed JSON data structure:", Object.keys(parsedData));

    let quizTitle = "Импортированный тест";
    let quizDescription = "Тест, импортированный из файла";
    let parsedQuestions: Question[] = [];

    // Check if the data is our pre-generated info security tests format
    if (
      parsedData.title &&
      parsedData.description &&
      parsedData.questions &&
      Array.isArray(parsedData.questions)
    ) {
      console.log(
        `Detected pre-generated test: "${parsedData.title}" with ${parsedData.questions.length} questions`
      );

      if (parsedData.title) {
        quizTitle = parsedData.title;
      }

      if (parsedData.description) {
        quizDescription = parsedData.description;
      }

      const mappedQuestions = parsedData.questions.map(
        (q: any, index: number) => ({
          ...q,
          order: q.order || index + 1,
          type: validateQuestionType(q.type),
          points: q.points || 1,
        })
      );
      parsedQuestions = validateQuestions(mappedQuestions);
    }
    // Check if the data is an array of questions directly
    else if (Array.isArray(parsedData)) {
      console.log(`JSON is an array with ${parsedData.length} items`);
      parsedQuestions = validateQuestions(parsedData);
    }
    // Check if the data is a quiz object with questions
    else if (parsedData.questions && Array.isArray(parsedData.questions)) {
      if (parsedData.title) {
        quizTitle = parsedData.title;
      }

      if (parsedData.description) {
        quizDescription = parsedData.description;
      }

      parsedQuestions = validateQuestions(parsedData.questions);
    } else {
      throw new Error("Неверный формат JSON: отсутствует массив вопросов");
    }

    return {
      quizTitle,
      quizDescription,
      questions: parsedQuestions,
    };
  } catch (error) {
    console.error("JSON parsing error:", error);
    throw new Error(
      `Ошибка при разборе JSON файла: ${error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

// Function to validate questions
export const validateQuestions = (questions: any[]): Question[] => {
  console.log("Validating questions, count:", questions.length);

  const validQuestions = questions.filter((q, index) => {
    try {
      // Basic validation for required fields
      if (!q.text) {
        console.log(`Question ${index + 1} missing text:`, q);
        return false;
      }

      // Ensure question type is valid
      if (!q.type) {
        q.type = detectQuestionType(q);
      } else {
        const originalType = q.type;
        q.type = validateQuestionType(q.type);

        if (originalType !== q.type) {
          console.log(
            `Question ${index + 1} type converted: ${originalType} -> ${q.type
            }`
          );
        }
      }

      // Ensure options and correctAnswers are arrays
      if (!Array.isArray(q.options)) {
        q.options = q.options ? [q.options] : [];
      }

      if (!Array.isArray(q.correctAnswers)) {
        q.correctAnswers = q.correctAnswers ? [q.correctAnswers] : [];
      }

      // For TRUE_FALSE, create standard options
      if (q.type === "TRUE_FALSE" && (!q.options || q.options.length === 0)) {
        q.options = ["Верно", "Неверно"];
        if (!q.correctAnswers || q.correctAnswers.length === 0) {
          q.correctAnswers = ["Верно"];
        }
      }

      // Ensure points and order are set
      if (!q.points) {
        q.points = 1;
      }

      if (!q.order) {
        q.order = index + 1;
      }

      // Additional validity check based on question type
      let isValid = true;

      switch (q.type) {
        case "MULTIPLE_CHOICE":
        case "SINGLE_CHOICE":
          isValid = q.options.length > 0 && q.correctAnswers.length > 0;

          // For SINGLE_CHOICE, ensure only one correct answer
          if (q.type === "SINGLE_CHOICE" && q.correctAnswers.length > 1) {
            q.correctAnswers = [q.correctAnswers[0]];
          }
          break;
        case "TRUE_FALSE":
          isValid = true; // Already handled above
          break;
        case "MATCHING":
          isValid =
            q.options.length > 0 &&
            (q.correctAnswers.length > 0 || q.matchingPairs);
          break;
        default:
          isValid = false;
      }

      return isValid;
    } catch (err) {
      console.error(`Error validating question ${index + 1}:`, err);
      return false;
    }
  });

  console.log(
    `Validated ${validQuestions.length} of ${questions.length} questions`
  );

  if (validQuestions.length === 0 && questions.length > 0) {
    throw new Error(
      "Ни один вопрос не прошел валидацию. Проверьте формат вопросов."
    );
  }

  return validQuestions;
}; 