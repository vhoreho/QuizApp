import { ChangeEvent, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CrossCircledIcon } from "@radix-ui/react-icons";

interface QuestionImportFormProps {
  onFileChange: (file: File) => void;
  onImport: () => void;
  error: string | null;
  isLoading: boolean;
}

export function QuestionImportForm({
  onFileChange,
  onImport,
  error,
  isLoading,
}: QuestionImportFormProps) {
  const [fileName, setFileName] = useState<string>("");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onFileChange(file);
    }
  };

  return (
    <Card className="w-full border-0 shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0">
        <CardTitle>Импорт вопросов</CardTitle>
        <CardDescription>
          Загрузите файл с вопросами в формате JSON или CSV
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Выберите файл</Label>
            <div className="flex items-center gap-2">
              <Input
                id="file"
                type="file"
                accept=".json,.csv"
                onChange={handleFileChange}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
            </div>
            {fileName && (
              <p className="text-sm text-muted-foreground mt-1">
                Выбранный файл: {fileName}
              </p>
            )}
          </div>

          {error && (
            <Alert variant="destructive" className="flex items-start">
              <CrossCircledIcon className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <AlertTitle className="mb-1">
                  Ошибка при загрузке файла
                </AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </div>
            </Alert>
          )}

          <Button
            onClick={onImport}
            disabled={!fileName || isLoading}
            className="w-full"
          >
            {isLoading ? "Импорт..." : "Импортировать вопросы"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
