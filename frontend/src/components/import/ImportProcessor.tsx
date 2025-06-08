import { Question } from "@/lib/types";
import { quizApi } from "@/api/quizApi";
import { parseJsonQuiz } from "./importService";
import { QuestionParserResult } from "./types";

interface ImportProcessorProps {
  file: File | null;
  title: string;
  description: string;
  subjectId: number;
  onImportStart: () => void;
  onProgress: (progress: number, status: string, step: number) => void;
  onSuccess: (
    title: string,
    description: string,
    questions: Question[]
  ) => void;
  onError: (error: string) => void;
}

export function ImportProcessor({
  file,
  title,
  description,
  subjectId,
  onImportStart,
  onProgress,
  onSuccess,
  onError,
}: ImportProcessorProps) {
  const importQuiz = async () => {
    if (!file) {
      onError("Файл не выбран");
      return;
    }

    onImportStart();
    onProgress(0, "Чтение файла...", 1);

    try {
      // Log file information
      console.log("Importing file:", {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: new Date(file.lastModified).toISOString(),
      });

      // Read the file
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          // Log the first 200 characters of content to check file structure
          console.log("File content preview:", content.slice(0, 200) + "...");

          onProgress(25, "Анализ содержимого файла...", 2);

          // Parse the JSON file content
          const parseResult: QuestionParserResult = parseJsonQuiz(content);

          console.log("Parse result:", {
            title: parseResult.quizTitle,
            description: parseResult.quizDescription,
            questionsCount: parseResult.questions?.length || 0,
            questionsType: Array.isArray(parseResult.questions)
              ? "array"
              : typeof parseResult.questions,
          });

          // Ensure questions is an array
          const questionsArray = Array.isArray(parseResult.questions)
            ? parseResult.questions
            : [];

          if (questionsArray.length === 0) {
            throw new Error("Не удалось получить вопросы из файла");
          }

          const quizTitle = title || parseResult.quizTitle;
          const quizDescription = description || parseResult.quizDescription;

          console.log(
            `Successfully parsed ${questionsArray.length} questions:`,
            questionsArray.slice(0, 2)
          );

          onProgress(
            50,
            `Найдено ${questionsArray.length} вопросов. Создаем тест...`,
            3
          );

          try {
            // Use API method to import quiz
            onProgress(75, "Создание теста и импорт вопросов...", 3);

            console.log("Sending to API:", {
              title: quizTitle,
              description: quizDescription,
              subjectId: subjectId,
              questionsCount: questionsArray.length,
              firstQuestion: questionsArray[0],
            });

            await quizApi.importQuizFromFile(
              quizTitle,
              quizDescription,
              subjectId,
              questionsArray
            );

            onSuccess(quizTitle, quizDescription, questionsArray);
          } catch (apiError: any) {
            console.error("Error importing quiz:", apiError);

            let errorMessage = "Ошибка при создании теста и импорте вопросов";

            if (apiError.response?.data?.message) {
              errorMessage = apiError.response.data.message;
            } else if (apiError.message) {
              errorMessage = apiError.message;
            }

            onError(errorMessage);
          }
        } catch (parseError: any) {
          console.error("Error parsing file:", parseError);
          onError(parseError.message || "Ошибка при обработке файла");
        }
      };

      reader.onerror = () => {
        onError("Ошибка при чтении файла");
      };

      reader.readAsText(file);
    } catch (fileError: any) {
      console.error("File reading error:", fileError);
      onError(fileError.message || "Ошибка при чтении файла");
    }
  };

  return { importQuiz };
}
