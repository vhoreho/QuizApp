import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { QuestionImportForm } from "@/components/import/QuestionImportForm";
import { Question } from "@/lib/types";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  InfoCircledIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  FileIcon,
  FileTextIcon,
} from "@radix-ui/react-icons";
import { teacherApi } from "@/api/quizApi";
import { ROUTES } from "@/lib/constants";
import {
  FileUp,
  Upload,
  Database,
  CheckCircle,
  AlertCircle,
  FileText,
  List,
  HelpCircle,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
  const [importStep, setImportStep] = useState<number>(0);

  // Example file contents
  const jsonExample = {
    title: "Пример теста",
    description: "Описание примера теста",
    questions: [
      {
        text: "Какой тип вопроса предполагает один правильный ответ?",
        type: "SINGLE_CHOICE",
        options: ["SINGLE_CHOICE", "MULTIPLE_CHOICE", "TRUE_FALSE", "MATCHING"],
        correctAnswers: ["SINGLE_CHOICE"],
        points: 1,
        order: 1,
      },
      {
        text: "Выберите все правильные утверждения:",
        type: "MULTIPLE_CHOICE",
        options: [
          "React — это библиотека JavaScript",
          "React разработан компанией Facebook",
          "React используется только для мобильных приложений",
          "React не поддерживает серверный рендеринг",
        ],
        correctAnswers: [
          "React — это библиотека JavaScript",
          "React разработан компанией Facebook",
        ],
        points: 2,
        order: 2,
      },
      {
        text: "React основан на компонентном подходе:",
        type: "TRUE_FALSE",
        options: ["Верно", "Неверно"],
        correctAnswers: ["Верно"],
        points: 1,
        order: 3,
      },
    ],
  };

  const csvExample = `text,type,options,correctAnswers,points,order
Какой тип вопроса предполагает один правильный ответ?,SINGLE_CHOICE,SINGLE_CHOICE;MULTIPLE_CHOICE;TRUE_FALSE;MATCHING,SINGLE_CHOICE,1,1
Выберите все правильные утверждения:,MULTIPLE_CHOICE,React — это библиотека JavaScript;React разработан компанией Facebook;React используется только для мобильных приложений;React не поддерживает серверный рендеринг,React — это библиотека JavaScript;React разработан компанией Facebook,2,2
React основан на компонентном подходе:,TRUE_FALSE,Верно;Неверно,Верно,1,3`;

  // Function to download example files
  const downloadExampleFile = (fileType: "json" | "csv") => {
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

    toast({
      title: `Файл ${fileName} скачан`,
      description: "Используйте этот файл как шаблон для создания вашего теста",
      variant: "default",
    });
  };

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
    setImportStep(1);

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

          let parsedQuestions: Question[] = [];
          let quizTitle = "Импортированный тест";
          let quizDescription = "Тест, импортированный из файла";

          setImportStatus("Анализ содержимого файла...");
          setImportProgress(25);
          setImportStep(2);

          // Parse the file content based on file type
          if (fileType === "json") {
            try {
              // Попробуем прочитать JSON и извлечь название и описание, если они есть
              const jsonData = JSON.parse(content);
              console.log("JSON structure:", Object.keys(jsonData));

              if (jsonData.title) {
                quizTitle = jsonData.title;
                setTitle(quizTitle);
                console.log("Found title:", quizTitle);
              }
              if (jsonData.description) {
                quizDescription = jsonData.description;
                setDescription(quizDescription);
                console.log("Found description:", quizDescription);
              }

              // Получаем вопросы
              if (Array.isArray(jsonData.questions)) {
                console.log(
                  `Found ${jsonData.questions.length} questions in the questions array`
                );
                parsedQuestions = parseJsonQuiz(content);
              } else if (Array.isArray(jsonData)) {
                console.log(`JSON is an array with ${jsonData.length} items`);
                parsedQuestions = validateQuestions(jsonData);
              } else {
                throw new Error(
                  "Неверный формат JSON: отсутствует массив вопросов"
                );
              }
            } catch (jsonError) {
              console.error("Error parsing JSON:", jsonError);
              throw jsonError;
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
            `Successfully parsed ${parsedQuestions.length} questions:`,
            parsedQuestions.slice(0, 2)
          );
          setQuestions(parsedQuestions);
          setImportStatus(
            `Найдено ${parsedQuestions.length} вопросов. Создаем тест...`
          );
          setImportProgress(50);
          setImportStep(3);

          try {
            // Use our new API method to import quiz
            setImportStatus("Создание теста и импорт вопросов...");
            setImportProgress(75);

            await teacherApi.importQuizFromFile(
              title || quizTitle,
              description || quizDescription,
              parsedQuestions
            );

            setImportProgress(100);
            setImportStatus("Тест успешно импортирован!");
            setImportStep(4);

            // Show success toast
            toast({
              title: "Тест успешно импортирован",
              description: `Добавлено ${parsedQuestions.length} вопросов из файла.`,
              variant: "default",
            });

            // Navigate to home page after short delay
            setTimeout(() => {
              navigate(ROUTES.HOME);
            }, 2000);
          } catch (apiError: any) {
            console.error("Error importing quiz:", apiError);

            let errorMessage = "Ошибка при создании теста и импорте вопросов";

            if (apiError.response?.data?.message) {
              errorMessage = apiError.response.data.message;
            } else if (apiError.message) {
              errorMessage = apiError.message;
            }

            setError(errorMessage);
            setImportProgress(0);
            setImportStep(5); // Error state

            toast({
              title: "Ошибка импорта",
              description:
                "Не удалось импортировать тест. Проверьте формат данных.",
              variant: "destructive",
            });
          }
        } catch (parseError: any) {
          console.error("Error parsing file:", parseError);
          setError(parseError.message || "Ошибка при обработке файла");
          setImportProgress(0);
          setImportStep(5); // Error state
        } finally {
          setIsLoading(false);
        }
      };

      reader.onerror = () => {
        setError("Ошибка при чтении файла");
        setIsLoading(false);
        setImportProgress(0);
        setImportStep(5); // Error state
      };

      reader.readAsText(file);
    } catch (fileError: any) {
      console.error("File reading error:", fileError);
      setError(fileError.message || "Ошибка при чтении файла");
      setIsLoading(false);
      setImportProgress(0);
      setImportStep(5); // Error state
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
            order: q.order || index + 1,
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
    console.warn(
      `Unknown question type: "${type}", defaulting to SINGLE_CHOICE`
    );
    return "SINGLE_CHOICE";
  };

  // Special function to auto-detect question type based on content
  const autoDetectQuestionType = (question: any): string => {
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
            `Question ${index + 1} no type specified, auto-detected as: ${
              q.type
            }`
          );
        } else {
          const originalType = q.type;
          q.type = autoDetectQuestionType(q);

          if (originalType !== q.type) {
            console.log(
              `Question ${index + 1} type converted: ${originalType} -> ${
                q.type
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
                `Question ${
                  index + 1
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
                `Question ${
                  index + 1
                } has multiple correct answers for SINGLE_CHOICE, taking the first one`
              );
              q.correctAnswers = [q.correctAnswers[0]];
            }

            if (!isValid) {
              console.log(
                `Question ${
                  index + 1
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

  const renderStepIcon = (step: number, currentStep: number) => {
    const isActive = currentStep >= step;
    const isError = currentStep === 5;

    let Icon;
    let stepText = "";

    switch (step) {
      case 1:
        Icon = FileUp;
        stepText = "Загрузка";
        break;
      case 2:
        Icon = FileText;
        stepText = "Анализ";
        break;
      case 3:
        Icon = List;
        stepText = "Обработка";
        break;
      case 4:
        Icon = CheckCircle;
        stepText = "Завершение";
        break;
      default:
        Icon = HelpCircle;
        stepText = "";
    }

    return (
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center mb-2",
            isActive && !isError
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground",
            isError &&
              step <= currentStep &&
              "bg-destructive text-destructive-foreground"
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <span
          className={cn(
            "text-xs font-medium",
            isActive && !isError ? "text-primary" : "text-muted-foreground",
            isError && step <= currentStep && "text-destructive"
          )}
        >
          {stepText}
        </span>
      </div>
    );
  };

  return (
    <div className="container max-w-5xl mx-auto py-8 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Импорт теста из файла
        </h1>
        <p className="text-muted-foreground">
          Создайте тест, загрузив файл с вопросами в формате JSON или CSV
        </p>
      </div>

      <Card className="border-t-4 border-t-primary">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            Импорт теста
          </CardTitle>
          <CardDescription>
            Загрузите файл с вопросами для создания нового теста
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="mb-8">
            <Alert className="mb-6 bg-blue-50 border-blue-200">
              <InfoCircledIcon className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-700">Что нужно знать</AlertTitle>
              <AlertDescription className="text-blue-600">
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Поддерживаются форматы JSON и CSV</li>
                  <li>
                    Для JSON: укажите поля title, description и массив questions
                  </li>
                  <li>
                    Для CSV: первая строка должна содержать заголовки (text,
                    type, options, correctAnswers)
                  </li>
                  <li>
                    Поддерживаемые типы вопросов: SINGLE_CHOICE,
                    MULTIPLE_CHOICE, TRUE_FALSE, MATCHING
                  </li>
                </ul>
              </AlertDescription>
            </Alert>

            {isLoading && (
              <div className="mb-8">
                <div className="flex justify-between mb-6 max-w-3xl mx-auto">
                  {[1, 2, 3, 4].map((step) => (
                    <div key={step} className="flex items-center relative">
                      {renderStepIcon(step, importStep)}
                      {step < 4 && (
                        <div
                          className={cn(
                            "h-0.5 w-20 absolute -right-12 top-5",
                            importStep >= step + 1 && importStep !== 5
                              ? "bg-primary"
                              : "bg-muted",
                            importStep === 5 && step < importStep
                              ? "bg-destructive"
                              : ""
                          )}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-4 mb-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium">{importStatus}</p>
                      <span className="text-sm font-medium">
                        {importProgress}%
                      </span>
                    </div>
                    <Progress
                      value={importProgress}
                      className={cn(
                        "h-2",
                        importStep === 5 ? "bg-destructive/20" : "bg-primary/20"
                      )}
                    />
                  </div>
                </div>

                {importStep === 5 && error && (
                  <Alert
                    variant="destructive"
                    className="mt-4 bg-red-50 border-red-200"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Ошибка импорта</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {importStep === 4 && (
                  <div className="text-center p-6 mt-4 bg-green-50 rounded-lg">
                    <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-2" />
                    <h3 className="text-lg font-medium text-green-800">
                      Импорт завершен успешно!
                    </h3>
                    <p className="text-green-600 mt-1">
                      Добавлено {questions.length} вопросов. Перенаправление...
                    </p>
                  </div>
                )}
              </div>
            )}

            {!isLoading && (
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-100">
                <div className="flex items-center justify-center mb-6">
                  <Upload className="h-14 w-14 text-primary p-3 bg-primary/10 rounded-full" />
                </div>
                <QuestionImportForm
                  onFileChange={handleFileChange}
                  onImport={handleImportQuestions}
                  error={error}
                  isLoading={isLoading}
                />
              </div>
            )}
          </div>

          <div className="pt-4 border-t">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              Примеры форматов файлов:
              <span className="text-sm text-muted-foreground ml-2">
                (нажмите на кнопку, чтобы скачать пример файла)
              </span>
            </h3>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-50 p-4 rounded-md border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileTextIcon className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium">JSON Формат</h4>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                    onClick={() => downloadExampleFile("json")}
                  >
                    <Download className="h-4 w-4 mr-1" /> Скачать пример
                  </Button>
                </div>
                <pre className="bg-slate-800 p-3 rounded text-xs text-slate-100 overflow-x-auto">
                  {`{
  "title": "Название теста",
  "description": "Описание теста",
  "questions": [
    {
      "text": "Вопрос 1?",
      "type": "SINGLE_CHOICE",
      "options": ["Вариант 1", "Вариант 2"],
      "correctAnswers": ["Вариант 1"],
      "points": 1
    }
  ]
}`}
                </pre>
              </div>

              <div className="bg-slate-50 p-4 rounded-md border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileIcon className="h-5 w-5 text-green-600" />
                    <h4 className="font-medium">CSV Формат</h4>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-green-600 hover:text-green-800 hover:bg-green-50"
                    onClick={() => downloadExampleFile("csv")}
                  >
                    <Download className="h-4 w-4 mr-1" /> Скачать пример
                  </Button>
                </div>
                <pre className="bg-slate-800 p-3 rounded text-xs text-slate-100 overflow-x-auto">
                  {`text,type,options,correctAnswers,points
Вопрос 1?,SINGLE_CHOICE,Вариант 1;Вариант 2,Вариант 1,1
Вопрос 2?,MULTIPLE_CHOICE,Опция A;Опция B;Опция C,Опция A;Опция C,2`}
                </pre>
              </div>
            </div>

            <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <FileTextIcon className="h-5 w-5 text-amber-700" />
                </div>
                <div>
                  <h4 className="font-medium text-amber-900">
                    Импортировать готовый тест "Основы информационной
                    безопасности"
                  </h4>
                  <p className="text-sm text-amber-800 mt-1">
                    Быстрый способ протестировать функцию импорта с полноценным
                    тестом из 20 вопросов
                  </p>
                </div>
              </div>

              <Button
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                onClick={() => {
                  const infosecTest = {
                    title: "Основы информационной безопасности",
                    description:
                      "Тест на базовые знания информационной безопасности",
                    questions: [
                      {
                        text: "Что такое фишинг?",
                        type: "SINGLE_CHOICE",
                        options: [
                          "Метод атаки, направленный на получение конфиденциальной информации путем обмана",
                          "Программа для защиты от вирусов",
                          "Метод шифрования данных",
                          "Технология для безопасной передачи данных",
                        ],
                        correctAnswers: [
                          "Метод атаки, направленный на получение конфиденциальной информации путем обмана",
                        ],
                        points: 1,
                        order: 1,
                      },
                      {
                        text: "Какой из следующих протоколов обеспечивает защищенное соединение в веб-браузере?",
                        type: "SINGLE_CHOICE",
                        options: ["HTTP", "HTTPS", "FTP", "SMTP"],
                        correctAnswers: ["HTTPS"],
                        points: 1,
                        order: 2,
                      },
                      {
                        text: "Что такое брандмауэр (файрвол)?",
                        type: "SINGLE_CHOICE",
                        options: [
                          "Программа для блокировки нежелательных рекламных сообщений",
                          "Устройство или ПО, которое контролирует сетевой трафик в соответствии с правилами безопасности",
                          "Система для обнаружения вредоносных программ",
                          "Протокол передачи данных",
                        ],
                        correctAnswers: [
                          "Устройство или ПО, которое контролирует сетевой трафик в соответствии с правилами безопасности",
                        ],
                        points: 1,
                        order: 3,
                      },
                      {
                        text: "Что такое двухфакторная аутентификация?",
                        type: "SINGLE_CHOICE",
                        options: [
                          "Способ защиты, требующий два пароля",
                          "Способ защиты, требующий подтверждение личности по двум разным категориям данных",
                          "Метод шифрования, использующий два ключа",
                          "Система с двумя разными антивирусами",
                        ],
                        correctAnswers: [
                          "Способ защиты, требующий подтверждение личности по двум разным категориям данных",
                        ],
                        points: 1,
                        order: 4,
                      },
                      {
                        text: "Какой тип вредоносного ПО шифрует файлы пользователя и требует выкуп за их расшифровку?",
                        type: "SINGLE_CHOICE",
                        options: ["Spyware", "Вирус", "Ransomware", "Червь"],
                        correctAnswers: ["Ransomware"],
                        points: 1,
                        order: 5,
                      },
                    ],
                  };

                  setTitle(infosecTest.title);
                  setDescription(infosecTest.description);
                  const validatedQuestions = validateQuestions(
                    infosecTest.questions
                  );
                  setQuestions(validatedQuestions);

                  toast({
                    title: "Тест готов к импорту",
                    description: `Загружен тест "${infosecTest.title}" с ${validatedQuestions.length} вопросами. Нажмите "Импортировать" для создания теста.`,
                    variant: "default",
                  });

                  // Create a file object from the JSON data
                  const fileContent = JSON.stringify(infosecTest, null, 2);
                  const fileBlob = new Blob([fileContent], {
                    type: "application/json",
                  });
                  const fileName = "infosec-test.json";
                  const file = new File([fileBlob], fileName, {
                    type: "application/json",
                  });

                  // Update component state as if a file was uploaded
                  setFile(file);
                  setFileType("json");
                  setError(null);
                }}
              >
                Импортировать готовый тест
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
}
