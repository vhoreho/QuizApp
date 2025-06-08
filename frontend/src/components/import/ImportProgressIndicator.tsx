import { CheckCircle, AlertCircle, FileUp, FileText, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ImportProgressState } from "./types";

interface ImportProgressIndicatorProps extends ImportProgressState {}

export function ImportProgressIndicator({
  isLoading,
  error,
  importProgress,
  importStatus,
  importStep,
}: ImportProgressIndicatorProps) {
  if (!isLoading) return null;

  return (
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
                  importStep === 5 && step < importStep ? "bg-destructive" : ""
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
            <span className="text-sm font-medium">{importProgress}%</span>
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
        <Alert variant="destructive" className="mt-4 bg-red-50 border-red-200">
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
            Тест успешно импортирован. Перенаправление...
          </p>
        </div>
      )}
    </div>
  );
}

// Helper function to render step icons
function renderStepIcon(step: number, currentStep: number) {
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
      Icon = FileUp;
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
}
