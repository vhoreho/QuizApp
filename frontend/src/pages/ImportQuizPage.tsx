import { ChangeEvent, FormEvent, useState } from "react";
import api from "@/api/axiosConfig";
import { useNavigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuizInfoForm } from "@/components/import/QuizInfoForm";
import { QuestionImportForm } from "@/components/import/QuestionImportForm";
import { Question } from "@/lib/types";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoCircledIcon } from "@radix-ui/react-icons";

enum ImportStep {
  INFO,
  QUESTIONS,
}

export default function ImportQuizPage() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState<ImportStep>(ImportStep.INFO);
  const [quizId, setQuizId] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [importProgress, setImportProgress] = useState<number>(0);
  const [importStatus, setImportStatus] = useState<string>("");

  // Function to handle quiz creation (step 1)
  const handleCreateQuiz = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Create the quiz with just title and description
      const response = await api.post("/quizzes", {
        title,
        description,
      });

      // Store the quiz ID for the next step
      setQuizId(response.data.id);

      // Move to the next step
      setStep(ImportStep.QUESTIONS);

      toast({
        title: "Тест создан!",
        description: "Теперь вы можете добавить вопросы.",
      });
    } catch (error) {
      console.error("Error creating quiz:", error);
      setError("Ошибка при создании теста. Пожалуйста, попробуйте еще раз.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle file change
  const handleFileChange = (file: File) => {
    setFile(file);
    setFileType(file.name.split(".").pop()?.toLowerCase() || "");
    setError(null);
  };

  // Function to handle file import and question creation
  const handleImportQuestions = async () => {
    if (!file || !quizId) return;

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

          console.log("File content loaded, type:", fileType);
          setImportStatus("Анализ содержимого файла...");

          // Parse the file content based on file type
          if (fileType === "json") {
            parsedQuestions = parseJsonQuiz(content);
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
            `Найдено ${parsedQuestions.length} вопросов. Начинаем импорт...`
          );

          // Create questions one by one
          let createdCount = 0;
          const totalQuestions = parsedQuestions.length;

          for (const question of parsedQuestions) {
            try {
              await createQuestion(question, quizId);
              createdCount++;

              // Update progress
              const progressPercent = Math.round(
                (createdCount / totalQuestions) * 100
              );
              setImportProgress(progressPercent);
              setImportStatus(
                `Импортировано ${createdCount} из ${totalQuestions} вопросов (${progressPercent}%)`
              );

              if (createdCount % 5 === 0 || createdCount === totalQuestions) {
                console.log(
                  `Создано ${createdCount} из ${totalQuestions} вопросов`
                );
              }
            } catch (err) {
              console.error("Failed to create question:", err, question);
              // Continue with other questions
            }
          }

          // Show success message
          toast({
            title: "Вопросы импортированы!",
            description: `Добавлено ${createdCount} из ${parsedQuestions.length} вопросов.`,
          });

          // Redirect to the appropriate page based on user role
          const userRole = localStorage.getItem("userRole");
          if (userRole === "admin") {
            navigate("/admin/quizzes");
          } else if (userRole === "teacher") {
            navigate("/teacher/quizzes");
          } else {
            navigate("/");
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

  // Function to create a single question
  const createQuestion = async (question: Question, quizId: string) => {
    try {
      const questionDto = {
        quizId,
        text: question.text,
        type: question.type,
        order: question.order || 0,
        points: question.points || 1,
        correctAnswers: question.correctAnswers || [],
        options: question.options || [],
      };

      console.log("Creating question:", questionDto);
      await api.post("/questions", questionDto);
    } catch (error) {
      console.error("Error creating question:", error);
      throw new Error(
        `Ошибка при создании вопроса: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
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

  // Function to handle going back to step 1
  const handleBack = () => {
    setStep(ImportStep.INFO);
    setError(null);
  };

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Импорт теста</h1>

      {step === ImportStep.INFO ? (
        <QuizInfoForm
          title={title}
          description={description}
          onTitleChange={(e) => setTitle(e.target.value)}
          onDescriptionChange={(e) => setDescription(e.target.value)}
          onSubmit={handleCreateQuiz}
          isLoading={isLoading}
        />
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{description}</p>
              <Button variant="outline" onClick={handleBack} className="mt-4">
                Редактировать информацию
              </Button>
            </CardContent>
          </Card>

          <QuestionImportForm
            onFileChange={handleFileChange}
            onImport={handleImportQuestions}
            error={error}
            isLoading={isLoading}
          />

          {isLoading && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Прогресс импорта</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Progress value={importProgress} className="h-2" />
                  <p className="text-center text-sm text-muted-foreground">
                    {importStatus}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {!isLoading && (
            <Alert className="mt-4 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
              <InfoCircledIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertTitle>Требования к файлу</AlertTitle>
              <AlertDescription>
                <p className="mt-2 text-sm">
                  Вы можете загрузить файл в формате JSON или CSV. Для JSON
                  файла вопросы должны иметь следующие поля:
                </p>
                <ul className="list-disc pl-6 mt-1 text-sm space-y-1">
                  <li>
                    <strong>text</strong> - текст вопроса
                  </li>
                  <li>
                    <strong>type</strong> - тип вопроса (MULTIPLE_CHOICE,
                    SINGLE_CHOICE, TRUE_FALSE)
                  </li>
                  <li>
                    <strong>options</strong> - массив вариантов ответа
                  </li>
                  <li>
                    <strong>correctAnswers</strong> - массив правильных ответов
                  </li>
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      <Toaster />
    </div>
  );
}
