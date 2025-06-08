import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Question } from "@/lib/types";
import { teacherApi } from "@/api/quizApi";
import { ROUTES } from "@/lib/constants";
import { infosecQuiz } from "./exampleData";
import { validateQuestions } from "./importService";

interface ImportControllerProps {
  onImportStart: () => void;
  onImportProgress: (progress: number, status: string, step: number) => void;
  onImportSuccess: (questions: Question[]) => void;
  onImportError: (error: string) => void;
}

export function useImportController() {
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

  // Function to handle file change
  const handleFileChange = (file: File) => {
    setFile(file);
    setFileType(file.name.split(".").pop()?.toLowerCase() || "");
    setError(null);
  };

  // Handler for using the InfoSec example quiz
  const handleUseInfosecExample = () => {
    setTitle(infosecQuiz.title);
    setDescription(infosecQuiz.description);

    try {
      const parsedQuestions = validateQuestions(infosecQuiz.questions);
      setQuestions(parsedQuestions);

      toast({
        title: "Тест готов к импорту",
        description: `Загружен тест "${infosecQuiz.title}" с ${parsedQuestions.length} вопросами. Нажмите "Импортировать" для создания теста.`,
        variant: "default",
      });

      // Create a file object from the JSON data
      const fileContent = JSON.stringify(infosecQuiz, null, 2);
      const fileBlob = new Blob([fileContent], { type: "application/json" });
      const fileName = "infosec-test.json";
      const file = new File([fileBlob], fileName, { type: "application/json" });

      // Update component state as if a file was uploaded
      setFile(file);
      setFileType("json");
      setError(null);
    } catch (error: any) {
      setError(error.message || "Ошибка при обработке примера теста");
    }
  };

  // Function to handle successful import
  const handleImportSuccess = (
    quizTitle: string,
    quizDescription: string,
    importedQuestions: Question[]
  ) => {
    setTitle(quizTitle);
    setDescription(quizDescription);
    setQuestions(importedQuestions);
    setImportProgress(100);
    setImportStatus("Тест успешно импортирован!");
    setImportStep(4);

    // Show success toast
    toast({
      title: "Тест успешно импортирован",
      description: `Добавлено ${importedQuestions.length} вопросов из файла.`,
      variant: "default",
    });

    // Navigate to home page after short delay
    setTimeout(() => {
      navigate(ROUTES.HOME);
    }, 2000);
  };

  // Function to handle import errors
  const handleImportError = (errorMessage: string) => {
    setError(errorMessage);
    setImportProgress(0);
    setImportStep(5); // Error state

    toast({
      title: "Ошибка импорта",
      description: "Не удалось импортировать тест. Проверьте формат данных.",
      variant: "destructive",
    });
  };

  return {
    title,
    description,
    file,
    fileType,
    questions,
    error,
    isLoading,
    importProgress,
    importStatus,
    importStep,
    setTitle,
    setDescription,
    setQuestions,
    setError,
    setIsLoading,
    setImportProgress,
    setImportStatus,
    setImportStep,
    handleFileChange,
    handleUseInfosecExample,
    handleImportSuccess,
    handleImportError,
  };
}
