import { Question } from "@/lib/types";
import { QuestionParserResult } from "./types";

// Helper function to map question types to our enum
export const mapQuestionType = (type: string): string => {
  // If type is already valid, return it as is
  const validTypes = [
    "SINGLE_CHOICE",
    "MULTIPLE_CHOICE",
    "TRUE_FALSE",
    "MATCHING",
  ];
  if (validTypes.includes(type)) {
    return type;
  }

  const typeLower = String(type).toLowerCase();

  if (typeLower.includes("multiple") || typeLower === "multiple_choice") {
    return "MULTIPLE_CHOICE";
  }

  if (typeLower.includes("single") || typeLower === "single_choice") {
    return "SINGLE_CHOICE";
  }

  if (
    typeLower.includes("true") ||
    typeLower.includes("false") ||
    typeLower === "true_false"
  ) {
    return "TRUE_FALSE";
  }

  if (typeLower.includes("match") || typeLower === "matching") {
    return "MATCHING";
  }

  // Default to single choice if unknown
  console.warn(`Unknown question type: "${type}", defaulting to SINGLE_CHOICE`);
  return "SINGLE_CHOICE";
};

// Special function to auto-detect question type based on content
export const autoDetectQuestionType = (question: any): string => {
  // If we already have a valid type, use it
  if (question.type) {
    const mappedType = mapQuestionType(question.type);

    // Special case: If it's MULTIPLE_CHOICE but has only one correct answer,
    // it might be better to treat it as SINGLE_CHOICE for the backend
    if (
      mappedType === "MULTIPLE_CHOICE" &&
      Array.isArray(question.correctAnswers) &&
      question.correctAnswers.length === 1
    ) {
      console.log(
        "Auto-converting MULTIPLE_CHOICE with single answer to SINGLE_CHOICE"
      );
      return "SINGLE_CHOICE";
    }

    return mappedType;
  }

  // No type specified, try to detect based on content
  if (question.correctAnswers) {
    if (Array.isArray(question.correctAnswers)) {
      if (question.correctAnswers.length > 1) {
        return "MULTIPLE_CHOICE";
      } else {
        return "SINGLE_CHOICE";
      }
    } else {
      // Single string/value
      return "SINGLE_CHOICE";
    }
  }

  // If we have matchingPairs, it's a matching question
  if (
    question.matchingPairs &&
    Object.keys(question.matchingPairs).length > 0
  ) {
    return "MATCHING";
  }

  // If options are just "True" and "False", it's probably TRUE_FALSE
  if (
    Array.isArray(question.options) &&
    question.options.length === 2 &&
    question.options.some(
      (o) =>
        o.toLowerCase().includes("true") || o.toLowerCase().includes("верно")
    ) &&
    question.options.some(
      (o) =>
        o.toLowerCase().includes("false") ||
        o.toLowerCase().includes("неверно")
    )
  ) {
    return "TRUE_FALSE";
  }

  // Default to SINGLE_CHOICE
  return "SINGLE_CHOICE";
};

// Function to parse JSON quiz
export const parseJsonQuiz = (content: string): QuestionParserResult => {
  try {
    const parsedData = JSON.parse(content);
    console.log("Parsed JSON data structure:", Object.keys(parsedData));

    let quizTitle = "Импортированный тест";
    let quizDescription = "Тест, импортированный из файла";
    let questions: Question[] = [];

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
          // Ensure all questions have the correct enum type
          type: mapQuestionType(q.type),
          // Ensure points exist
          points: q.points || 1,
        })
      );
      questions = validateQuestions(mappedQuestions);
      return { quizTitle, quizDescription, questions };
    }

    // Check if the data is an array of questions directly
    if (Array.isArray(parsedData)) {
      return {
        quizTitle,
        quizDescription,
        questions: validateQuestions(parsedData)
      };
    }

    // Check if the data is a quiz object with questions
    if (parsedData.questions && Array.isArray(parsedData.questions)) {
      if (parsedData.title) {
        quizTitle = parsedData.title;
      }

      if (parsedData.description) {
        quizDescription = parsedData.description;
      }

      return {
        quizTitle,
        quizDescription,
        questions: validateQuestions(parsedData.questions)
      };
    }

    throw new Error("Неверный формат JSON: отсутствует массив вопросов");
  } catch (error) {
    console.error("JSON parsing error:", error);
    throw new Error(
      `Ошибка при разборе JSON файла: ${error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

// Function to parse CSV quiz
export const parseCsvQuiz = (content: string): QuestionParserResult => {
  try {
    const lines = content.split("\n").filter((line) => line.trim() !== "");
    if (lines.length <= 1) {
      throw new Error(
        "CSV файл должен содержать заголовок и хотя бы одну строку данных"
      );
    }

    const headers = lines[0].split(",").map((header) => header.trim());
    const requiredHeaders = ["text", "type"];

    // Check if required headers exist
    if (!requiredHeaders.every((header) => headers.includes(header))) {
      throw new Error("CSV файл должен содержать столбцы: text, type");
    }

    const questions: Question[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((value) => value.trim());

      if (values.length < headers.length) continue;

      const question: any = {};

      // Map CSV headers to question properties
      headers.forEach((header, index) => {
        if (header === "options" || header === "correctAnswers") {
          // Parse arrays
          question[header] = values[index]
            .split(";")
            .map((item) => item.trim());
        } else if (header === "points" || header === "order") {
          // Parse numbers
          question[header] = parseInt(values[index]) || 0;
        } else {
          question[header] = values[index];
        }
      });

      // Validate the question
      if (question.text && question.type) {
        questions.push(question as Question);
      }
    }

    return {
      quizTitle: "Импортированный CSV тест",
      quizDescription: "Тест, импортированный из CSV файла",
      questions
    };
  } catch (error) {
    console.error("CSV parsing error:", error);
    throw new Error("Ошибка при разборе CSV файла");
  }
};

// Function to validate questions
export const validateQuestions = (questions: any[]): Question[] => {
  console.log("Validating questions, count:", questions.length);

  const validQuestions = questions.filter((q, index) => {
    try {
      // Log original question for debugging
      console.log(`Validating question ${index + 1}:`, q);

      // Basic validation for required fields
      if (!q.text) {
        console.log(`Question ${index + 1} missing text:`, q);
        return false;
      }

      // Auto-detect or map question type
      if (!q.type) {
        q.type = autoDetectQuestionType(q);
        console.log(
          `Question ${index + 1} no type specified, auto-detected as: ${q.type
          }`
        );
      } else {
        const originalType = q.type;
        q.type = autoDetectQuestionType(q);

        if (originalType !== q.type) {
          console.log(
            `Question ${index + 1} type converted: ${originalType} -> ${q.type
            }`
          );
        }
      }

      // Ensure correctAnswers and options are always arrays
      if (!Array.isArray(q.options)) {
        console.log(
          `Question ${index + 1} has invalid options format, fixing:`,
          q.options
        );
        q.options = q.options ? [q.options] : [];
      }

      if (!Array.isArray(q.correctAnswers)) {
        console.log(
          `Question ${index + 1} has invalid correctAnswers format, fixing:`,
          q.correctAnswers
        );
        q.correctAnswers = q.correctAnswers ? [q.correctAnswers] : [];
      }

      // For TRUE_FALSE, create standard options
      if (q.type === "TRUE_FALSE" && (!q.options || q.options.length === 0)) {
        console.log(
          `Question ${index + 1} adding default TRUE_FALSE options`
        );
        q.options = ["Верно", "Неверно"];
        if (!q.correctAnswers || q.correctAnswers.length === 0) {
          q.correctAnswers = ["Верно"]; // Default to true if not specified
        }
      }

      // Ensure points and order are set
      if (!q.points) {
        console.log(`Question ${index + 1} adding default points`);
        q.points = 1;
      }

      if (!q.order) {
        console.log(`Question ${index + 1} adding default order`);
        q.order = index + 1;
      }

      // Additional validity check based on question type
      let isValid = true;

      switch (q.type) {
        case "MULTIPLE_CHOICE":
          isValid = q.options.length > 0 && q.correctAnswers.length > 0;
          if (!isValid) {
            console.log(
              `Question ${index + 1
              } invalid: Missing options or correctAnswers for MULTIPLE_CHOICE`,
              {
                optionsLength: q.options.length,
                correctAnswersLength: q.correctAnswers.length,
              }
            );
          }
          break;
        case "SINGLE_CHOICE":
          isValid = q.options.length > 0 && q.correctAnswers.length > 0;

          // For SINGLE_CHOICE, we should only have one correct answer
          if (q.correctAnswers.length > 1) {
            console.log(
              `Question ${index + 1
              } has multiple correct answers for SINGLE_CHOICE, taking the first one`
            );
            q.correctAnswers = [q.correctAnswers[0]];
          }

          if (!isValid) {
            console.log(
              `Question ${index + 1
              } invalid: Missing options or correctAnswers for SINGLE_CHOICE`,
              {
                optionsLength: q.options.length,
                correctAnswersLength: q.correctAnswers.length,
              }
            );
          }
          break;
        case "TRUE_FALSE":
          isValid = true; // Already handled above
          break;
        case "MATCHING":
          isValid =
            q.options.length > 0 &&
            (q.correctAnswers.length > 0 || q.matchingPairs);
          if (!isValid) {
            console.log(
              `Question ${index + 1} invalid: Missing matching pairs`,
              {
                optionsLength: q.options.length,
                correctAnswersLength: q.correctAnswers.length,
                hasMatchingPairs: !!q.matchingPairs,
              }
            );
          }
          break;
        default:
          console.log(`Question ${index + 1} has unknown type: ${q.type}`);
          isValid = false;
      }

      if (isValid) {
        console.log(`Question ${index + 1} is valid`);
      }

      return isValid;
    } catch (err) {
      console.error(`Error validating question ${index + 1}:`, err, q);
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

  // Log a sample of the validated questions
  console.log("Sample of validated questions:", validQuestions.slice(0, 2));

  return validQuestions;
};

// Function to download example files
export const downloadExampleFile = (
  fileType: "json" | "csv",
  jsonExample: any,
  csvExample: string,
  onSuccess: (fileName: string) => void
) => {
  let fileName;
  let content;
  let mimeType;

  if (fileType === "json") {
    fileName = "example-quiz.json";
    content = JSON.stringify(jsonExample, null, 2);
    mimeType = "application/json";
  } else {
    fileName = "example-quiz.csv";
    content = csvExample;
    mimeType = "text/csv";
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  onSuccess(fileName);
};

// Function to validate question type
export const validateQuestionType = (type: string): string => {
  if (!type) return "SINGLE_CHOICE";

  const validTypes = [
    "SINGLE_CHOICE",
    "MULTIPLE_CHOICE",
    "TRUE_FALSE",
    "MATCHING",
  ];

  // Normalize the type string
  const normalizedType = String(type).toUpperCase().trim();

  // Check for exact match
  if (validTypes.includes(normalizedType)) {
    return normalizedType;
  }

  // Check for partial matches
  if (normalizedType.includes("SINGLE") || normalizedType.includes("ONE")) {
    return "SINGLE_CHOICE";
  }

  if (normalizedType.includes("MULTIPLE") || normalizedType.includes("MANY")) {
    return "MULTIPLE_CHOICE";
  }

  if (normalizedType.includes("TRUE") || normalizedType.includes("FALSE") || normalizedType.includes("BOOL")) {
    return "TRUE_FALSE";
  }

  if (normalizedType.includes("MATCH") || normalizedType.includes("PAIR")) {
    return "MATCHING";
  }

  // Default
  console.warn(`Unknown question type "${type}", defaulting to SINGLE_CHOICE`);
  return "SINGLE_CHOICE";
};

// Function to detect question type based on content
export const detectQuestionType = (question: any): string => {
  // If type is already specified, validate it
  if (question.type) {
    return validateQuestionType(question.type);
  }

  // Check for TRUE_FALSE questions
  if (
    Array.isArray(question.options) &&
    question.options.length === 2 &&
    (
      (question.options.some(o => String(o).toLowerCase().includes("true") || String(o).toLowerCase().includes("верно")) &&
        question.options.some(o => String(o).toLowerCase().includes("false") || String(o).toLowerCase().includes("неверно")))
    )
  ) {
    return "TRUE_FALSE";
  }

  // Check for MATCHING questions
  if (question.matchingPairs && typeof question.matchingPairs === "object") {
    return "MATCHING";
  }

  // Check for MULTIPLE_CHOICE questions
  if (
    Array.isArray(question.correctAnswers) &&
    question.correctAnswers.length > 1
  ) {
    return "MULTIPLE_CHOICE";
  }

  // Default to SINGLE_CHOICE
  return "SINGLE_CHOICE";
}; 