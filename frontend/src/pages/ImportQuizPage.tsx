import { useState } from "react";
import api from "@/api/axiosConfig";
import { useNavigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuestionImportForm } from "@/components/import/QuestionImportForm";
import { Question } from "@/lib/types";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoCircledIcon } from "@radix-ui/react-icons";

export default function ImportQuizPage() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [importProgress, setImportProgress] = useState<number>(0);
  const [importStatus, setImportStatus] = useState<string>("");

  // Function to handle file change
  const handleFileChange = (file: File) => {
    setFile(file);
    setFileType(file.name.split(".").pop()?.toLowerCase() || "");
    setError(null);
  };

  // Function to handle file import and question creation
  const handleImportQuestions = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setImportProgress(0);
    setImportStatus("Чтение файла...");

    try {
      // Read the file
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          let parsedQuestions: Question[] = [];
          let quizTitle = "Импортированный тест";
          let quizDescription = "Тест, импортированный из файла";

          console.log("File content loaded, type:", fileType);
          setImportStatus("Анализ содержимого файла...");

          // Parse the file content based on file type
          if (fileType === "json") {
            try {
              // Попробуем прочитать JSON и извлечь название и описание, если они есть
              const jsonData = JSON.parse(content);
              if (jsonData.title) {
                quizTitle = jsonData.title;
                setTitle(quizTitle);
              }
              if (jsonData.description) {
                quizDescription = jsonData.description;
                setDescription(quizDescription);
              }

              // Получаем вопросы
              if (Array.isArray(jsonData.questions)) {
                parsedQuestions = parseJsonQuiz(content);
              } else if (Array.isArray(jsonData)) {
                parsedQuestions = validateQuestions(jsonData);
              } else {
                throw new Error(
                  "Неверный формат JSON: отсутствует массив вопросов"
                );
              }
            } catch (jsonError) {
              console.error("Error parsing JSON:", jsonError);
              parsedQuestions = parseJsonQuiz(content);
            }
          } else if (fileType === "csv") {
            parsedQuestions = parseCsvQuiz(content);
          } else {
            throw new Error(`Неподдерживаемый формат файла: ${fileType}`);
          }

          // Check if we have questions
          if (parsedQuestions.length === 0) {
            throw new Error("Не удалось найти вопросы в файле");
          }

          console.log(
            `Successfully parsed ${parsedQuestions.length} questions`
          );
          setQuestions(parsedQuestions);
          setImportStatus(
            `Найдено ${parsedQuestions.length} вопросов. Создаем тест...`
          );

          try {
            // First, create the quiz
            setImportStatus("Создание теста...");
            setImportProgress(10);

            const quizResponse = await api.post("/quizzes", {
              title: quizTitle,
              description: quizDescription,
            });

            const quizId = quizResponse.data.id;
            setImportStatus(`Тест создан. Импортируем вопросы...`);
            setImportProgress(30);

            // Map the questions to the format expected by the API
            const questionsForBatch = parsedQuestions.map((question, index) => {
              // Базовые данные
              const questionDto: any = {
                quizId: Number(quizId),
                text: question.text,
                type: question.type,
                order: question.order || index,
                points: question.points || 1,
                options: question.options || [],
              };

              // В зависимости от типа вопроса добавляем нужные поля
              if (
                question.type === "SINGLE_CHOICE" ||
                question.type === "TRUE_FALSE"
              ) {
                // Некоторые вопросы могут иметь правильный ответ в виде строки,
                // а бэкенд ожидает это поле как correctAnswer
                questionDto.correctAnswer =
                  Array.isArray(question.correctAnswers) &&
                  question.correctAnswers.length > 0
                    ? question.correctAnswers[0]
                    : question.options[0] || "";
              } else if (question.type === "MULTIPLE_CHOICE") {
                questionDto.correctAnswers = question.correctAnswers || [];
              } else if (question.type === "MATCHING") {
                questionDto.matchingPairs = question.matchingPairs || {};
              }

              return questionDto;
            });

            // Send batch request
            setImportStatus("Импорт вопросов...");
            setImportProgress(50);

            const response = await api.post("/questions/batch", {
              quizId: Number(quizId),
              questions: questionsForBatch,
            });

            // Check response
            const batchResult = response.data;
            const createdCount = batchResult.createdQuestions.length;
            const failedCount = batchResult.failedQuestions.length;
            const totalQuestions = parsedQuestions.length;

            setImportProgress(100);

            if (failedCount > 0) {
              // Если есть неудачно созданные вопросы, показываем предупреждение
              setImportStatus(
                `Импортировано ${createdCount} из ${totalQuestions} вопросов. ${failedCount} вопросов не удалось импортировать.`
              );

              // Записываем информацию об ошибках в лог
              console.warn(
                "Failed to import some questions:",
                batchResult.failedQuestions
              );

              // Если все вопросы не удалось создать, показываем ошибку
              if (createdCount === 0) {
                setError(
                  `Не удалось импортировать ни один вопрос. Проверьте формат данных.`
                );
                setIsLoading(false);
                return;
              }

              // Показываем тост с предупреждением
              toast({
                title: "Тест импортирован с ошибками",
                description: `Добавлено ${createdCount} из ${totalQuestions} вопросов. ${failedCount} вопросов не удалось импортировать.`,
                variant: "destructive",
              });
            } else {
              // Если все вопросы успешно созданы
              setImportStatus(
                `Тест "${quizTitle}" с ${createdCount} вопросами успешно создан`
              );

              // Показываем тост с успехом
              toast({
                title: "Тест импортирован!",
                description: `Тест "${quizTitle}" с ${createdCount} вопросами успешно создан.`,
              });
            }

            // Redirect to the appropriate page based on user role after short delay
            setTimeout(
              () => {
                const userRole = localStorage.getItem("userRole");
                if (userRole === "admin") {
                  navigate("/admin/quizzes");
                } else if (userRole === "teacher") {
                  navigate("/teacher/quizzes");
                } else {
                  navigate("/");
                }
              },
              failedCount > 0 ? 1500 : 500
            ); // Longer delay if there were errors
          } catch (error: any) {
            console.error("Error during quiz import:", error);

            // Проверяем, есть ли в ответе информация о созданных вопросах
            if (error.response && error.response.data) {
              const responseData = error.response.data;

              if (
                responseData.createdQuestions &&
                responseData.createdQuestions.length > 0
              ) {
                const createdCount = responseData.createdQuestions.length;
                const failedCount = responseData.failedQuestions
                  ? responseData.failedQuestions.length
                  : 0;
                const totalQuestions = parsedQuestions.length;

                setImportStatus(
                  `Импортировано ${createdCount} из ${totalQuestions} вопросов с ошибками.`
                );

                toast({
                  title: "Частичный импорт",
                  description: `Добавлено ${createdCount} из ${totalQuestions} вопросов. ${failedCount} вопросов не удалось импортировать.`,
                  variant: "destructive",
                });

                // Редирект, так как часть вопросов все же была создана
                setTimeout(() => {
                  const userRole = localStorage.getItem("userRole");
                  if (userRole === "admin") {
                    navigate("/admin/quizzes");
                  } else if (userRole === "teacher") {
                    navigate("/teacher/quizzes");
                  } else {
                    navigate("/");
                  }
                }, 1500);

                return;
              }
            }

            // Если не удалось обработать ответ или нет информации о созданных вопросах
            setError("Ошибка при импорте теста. Попробуйте снова.");
            setIsLoading(false);
            setImportStatus("Произошла ошибка при импорте");
          }
        } catch (err) {
          console.error("Error processing file:", err);
          setError(
            err instanceof Error ? err.message : "Ошибка при обработке файла"
          );
          setIsLoading(false);
          setImportStatus("Произошла ошибка при импорте");
        }
      };

      reader.onerror = () => {
        setError("Ошибка при чтении файла");
        setIsLoading(false);
        setImportStatus("Ошибка чтения файла");
      };

      console.log("Reading file:", file.name);
      reader.readAsText(file);
    } catch (err) {
      console.error("Error importing questions:", err);
      setError("Ошибка при импорте вопросов");
      setIsLoading(false);
      setImportStatus("Произошла ошибка");
    }
  };

  // Function to parse JSON quiz
  const parseJsonQuiz = (content: string): Question[] => {
    try {
      const parsedData = JSON.parse(content);
      console.log("Parsed JSON data structure:", Object.keys(parsedData));

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

        const mappedQuestions = parsedData.questions.map(
          (q: any, index: number) => ({
            ...q,
            order: index + 1,
            // Ensure all questions have the correct enum type
            type: mapQuestionType(q.type),
            // Ensure points exist
            points: q.points || 1,
          })
        );
        return validateQuestions(mappedQuestions);
      }

      // Check if the data is an array of questions directly
      if (Array.isArray(parsedData)) {
        return validateQuestions(parsedData);
      }

      // Check if the data is a quiz object with questions
      if (parsedData.questions && Array.isArray(parsedData.questions)) {
        return validateQuestions(parsedData.questions);
      }

      throw new Error("Неверный формат JSON: отсутствует массив вопросов");
    } catch (error) {
      console.error("JSON parsing error:", error);
      throw new Error(
        `Ошибка при разборе JSON файла: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };

  // Helper function to map question types to our enum
  const mapQuestionType = (type: string): string => {
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

    // Default to multiple choice if unknown
    console.warn(
      `Unknown question type: "${type}", defaulting to MULTIPLE_CHOICE`
    );
    return "MULTIPLE_CHOICE";
  };

  // Function to parse CSV quiz
  const parseCsvQuiz = (content: string): Question[] => {
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

      return questions;
    } catch (error) {
      console.error("CSV parsing error:", error);
      throw new Error("Ошибка при разборе CSV файла");
    }
  };

  // Function to validate questions
  const validateQuestions = (questions: any[]): Question[] => {
    console.log("Validating questions:", questions);

    const validQuestions = questions.filter((q) => {
      try {
        // Basic validation for required fields
        if (!q.text || !q.type) {
          console.log("Missing text or type:", q);
          return false;
        }

        // Convert legacy type formats to enum values if needed
        if (typeof q.type === "string") {
          if (q.type === "single" || q.type === "SINGLE") {
            q.type = "SINGLE_CHOICE";
          } else if (q.type === "multiple" || q.type === "MULTIPLE") {
            q.type = "MULTIPLE_CHOICE";
          } else if (q.type === "true_false" || q.type === "TRUE_FALSE") {
            q.type = "TRUE_FALSE";
          } else if (q.type === "matching" || q.type === "MATCHING") {
            q.type = "MATCHING";
          }
        }

        // Ensure correctAnswers and options are always arrays
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
            q.correctAnswers = ["Верно"]; // Default to true if not specified
          }
        }

        // Ensure points and order are set
        q.points = q.points || 1;
        q.order = q.order || 0;

        // Validate based on question type
        switch (q.type) {
          case "MULTIPLE_CHOICE":
          case "SINGLE_CHOICE":
            return q.options.length > 0 && q.correctAnswers.length > 0;
          case "TRUE_FALSE":
            return true; // Already handled above
          case "MATCHING":
            return (
              q.options.length > 0 &&
              (q.correctAnswers.length > 0 || q.matchingPairs)
            );
          default:
            console.log("Unknown question type:", q.type);
            return false;
        }
      } catch (err) {
        console.error("Error validating question:", err, q);
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

  return (
    <div className="container max-w-4xl mx-auto py-6 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Импорт теста</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <InfoCircledIcon className="h-4 w-4" />
            <AlertTitle>Информация</AlertTitle>
            <AlertDescription>
              Загрузите файл с вопросами в формате JSON или CSV. Тест будет
              создан автоматически. Если в JSON файле есть поля title и
              description, они будут использованы как название и описание теста.
            </AlertDescription>
          </Alert>

          {isLoading ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm">{importStatus}</p>
                <Progress value={importProgress} />
              </div>
            </div>
          ) : (
            <QuestionImportForm
              onFileChange={handleFileChange}
              onImport={handleImportQuestions}
              error={error}
              isLoading={isLoading}
            />
          )}
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
}
