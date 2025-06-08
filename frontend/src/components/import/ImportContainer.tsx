import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { Database } from "lucide-react";
import { ImportForm } from "./ImportForm";
import { ImportProgressIndicator } from "./ImportProgressIndicator";
import { ImportExampleFiles } from "./ImportExampleFiles";
import { useImportController } from "./ImportController";
import { ImportProcessor } from "./ImportProcessor";
import { downloadExampleFile } from "./utils";
import { exampleData } from "./exampleData";
import { useToast } from "@/components/ui/use-toast";

export function ImportContainer() {
  const { toast } = useToast();
  const {
    title,
    description,
    file,
    error,
    isLoading,
    importProgress,
    importStatus,
    importStep,
    setIsLoading,
    setImportProgress,
    setImportStatus,
    setImportStep,
    handleFileChange,
    handleImportSuccess,
    handleImportError,
  } = useImportController();

  // Import processor handlers
  const handleImportStart = () => {
    setIsLoading(true);
  };

  const handleImportProgress = (
    progress: number,
    status: string,
    step: number
  ) => {
    setImportProgress(progress);
    setImportStatus(status);
    setImportStep(step);
  };

  // Function to handle example file download
  const handleDownloadExample = () => {
    downloadExampleFile(
      "json",
      exampleData.json,
      exampleData.csv,
      (fileName) => {
        toast({
          title: `Файл ${fileName} скачан`,
          description:
            "Используйте этот файл как шаблон для создания вашего теста",
          variant: "default",
        });
      }
    );
  };

  // Initialize the processor
  const { importQuiz } = ImportProcessor({
    file,
    title,
    description,
    categoryId: null,
    onImportStart: handleImportStart,
    onProgress: handleImportProgress,
    onSuccess: handleImportSuccess,
    onError: handleImportError,
  });

  return (
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
                <li>Поддерживается формат JSON</li>
                <li>Укажите поля title, description и массив questions</li>
                <li>
                  Поддерживаемые типы вопросов: SINGLE_CHOICE, MULTIPLE_CHOICE,
                  TRUE_FALSE, MATCHING
                </li>
              </ul>
            </AlertDescription>
          </Alert>

          <ImportProgressIndicator
            isLoading={isLoading}
            error={error}
            importProgress={importProgress}
            importStatus={importStatus}
            importStep={importStep}
          />

          {!isLoading && (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-100">
              <ImportForm
                onFileChange={handleFileChange}
                onImport={importQuiz}
                error={error}
                isLoading={isLoading}
              />
            </div>
          )}
        </div>

        <ImportExampleFiles onDownloadExample={handleDownloadExample} />
      </CardContent>
    </Card>
  );
}
