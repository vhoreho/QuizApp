import { ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  FileTextIcon,
  UploadIcon,
  ClipboardIcon,
  ArrowLeftIcon,
  EyeOpenIcon,
  ExclamationTriangleIcon,
} from "@radix-ui/react-icons";
import { Quiz } from "@/lib/types";
import QuizTemplateGenerator from "@/components/quiz/QuizTemplateGenerator";

interface FileImportProps {
  file: File | null;
  jsonText: string;
  csvText: string;
  previewData: Quiz | null;
  validationErrors: string[];
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onJsonTextChange: (value: string) => void;
  onCsvTextChange: (value: string) => void;
  onJsonImport: () => void;
  onCsvImport: () => void;
  onBack: () => void;
  onPreview: () => void;
}

export function FileImport({
  file,
  jsonText,
  csvText,
  previewData,
  validationErrors,
  onFileChange,
  onJsonTextChange,
  onCsvTextChange,
  onJsonImport,
  onCsvImport,
  onBack,
  onPreview,
}: FileImportProps) {
  return (
    <div>
      <Card className="border border-border bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 shadow-md hover:shadow-lg transition-all">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-100 dark:bg-indigo-900 p-2 rounded-full">
              <UploadIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <CardTitle>Импорт вопросов</CardTitle>
              <CardDescription>
                Выберите формат и загрузите вопросы
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs defaultValue="file" className="w-full">
            <TabsList className="grid grid-cols-3 mb-6 w-full max-w-md mx-auto">
              <TabsTrigger
                value="file"
                className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
              >
                <UploadIcon className="mr-2 h-4 w-4" />
                Файл
              </TabsTrigger>
              <TabsTrigger
                value="json"
                className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
              >
                <ClipboardIcon className="mr-2 h-4 w-4" />
                JSON
              </TabsTrigger>
              <TabsTrigger
                value="csv"
                className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
              >
                <FileTextIcon className="mr-2 h-4 w-4" />
                CSV
              </TabsTrigger>
            </TabsList>

            <TabsContent value="file">
              <div className="grid w-full max-w-md mx-auto items-center gap-4 p-4 border rounded-lg bg-white dark:bg-card">
                <div className="flex justify-center mb-4">
                  <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-full">
                    <UploadIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <Label
                  htmlFor="file"
                  className="text-base font-medium text-center block"
                >
                  Файл с вопросами
                </Label>
                <Input
                  id="file"
                  type="file"
                  accept=".csv,.xlsx,.xls,.json"
                  onChange={onFileChange}
                  className="border-primary/20 focus:border-primary"
                />
                <p className="text-sm text-muted-foreground text-center">
                  Поддерживаемые форматы: .csv, .xlsx, .xls, .json
                </p>
              </div>
            </TabsContent>

            <TabsContent value="json">
              <div className="space-y-4 max-w-3xl mx-auto p-4 border rounded-lg bg-white dark:bg-card">
                <div className="flex justify-center mb-4">
                  <div className="bg-violet-100 dark:bg-violet-900 p-4 rounded-full">
                    <ClipboardIcon className="h-8 w-8 text-violet-600 dark:text-violet-400" />
                  </div>
                </div>
                <Label htmlFor="json" className="text-base font-medium">
                  JSON формат
                </Label>
                <Textarea
                  id="json"
                  value={jsonText}
                  onChange={(e) => onJsonTextChange(e.target.value)}
                  placeholder='{"questions": [{"text": "Текст вопроса", "type": "SINGLE_CHOICE", "options": ["Вариант 1", "Вариант 2"], "correctAnswers": ["Вариант 1"]}]}'
                  className="min-h-[200px] font-mono text-sm border-primary/20 focus:border-primary"
                />
                <Button
                  variant="secondary"
                  onClick={onJsonImport}
                  disabled={!jsonText.trim()}
                  className="bg-violet-100 hover:bg-violet-200 text-violet-700 dark:bg-violet-900 dark:hover:bg-violet-800 dark:text-violet-300"
                >
                  <ClipboardIcon className="mr-2 h-4 w-4" />
                  Парсить JSON
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="csv">
              <div className="space-y-4 max-w-3xl mx-auto p-4 border rounded-lg bg-white dark:bg-card">
                <div className="flex justify-center mb-4">
                  <div className="bg-green-100 dark:bg-green-900 p-4 rounded-full">
                    <FileTextIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <Label htmlFor="csv" className="text-base font-medium">
                  CSV формат
                </Label>
                <Textarea
                  id="csv"
                  value={csvText}
                  onChange={(e) => onCsvTextChange(e.target.value)}
                  placeholder="Текст вопроса,тип,баллы,правильный ответ,Вариант 1,Вариант 2,Вариант 3"
                  className="min-h-[200px] font-mono text-sm border-primary/20 focus:border-primary"
                />
                <div className="text-sm text-muted-foreground p-3 bg-muted/20 rounded-md">
                  <p>
                    Формат:{" "}
                    <span className="font-mono">
                      Текст вопроса,тип,баллы,правильный ответ,варианты...
                    </span>
                  </p>
                  <p className="mt-1">
                    Типы:{" "}
                    <span className="font-mono bg-muted/30 px-1 rounded">
                      single
                    </span>
                    ,{" "}
                    <span className="font-mono bg-muted/30 px-1 rounded">
                      multiple
                    </span>
                    ,{" "}
                    <span className="font-mono bg-muted/30 px-1 rounded">
                      true_false
                    </span>
                    ,{" "}
                    <span className="font-mono bg-muted/30 px-1 rounded">
                      matching
                    </span>
                  </p>
                </div>
                <Button
                  variant="secondary"
                  onClick={onCsvImport}
                  disabled={!csvText.trim()}
                  className="bg-green-100 hover:bg-green-200 text-green-700 dark:bg-green-900 dark:hover:bg-green-800 dark:text-green-300"
                >
                  <FileTextIcon className="mr-2 h-4 w-4" />
                  Парсить CSV
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="bg-muted/10 border-t pt-4 flex justify-between">
          <Button
            variant="outline"
            onClick={onBack}
            className="border-primary/20 hover:bg-primary/5"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Назад
          </Button>
          {previewData &&
            previewData.questions &&
            previewData.questions.length > 0 && (
              <Button
                variant="default"
                onClick={onPreview}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
              >
                <EyeOpenIcon className="mr-2 h-4 w-4" />
                Предпросмотр вопросов ({previewData.questions.length})
              </Button>
            )}
        </CardFooter>
      </Card>

      {validationErrors.length > 0 && (
        <Alert
          variant="destructive"
          className="mt-6 bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
        >
          <ExclamationTriangleIcon className="h-5 w-5" />
          <AlertTitle>Ошибки валидации</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-6 mt-2">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="mt-8 bg-white dark:bg-card p-6 rounded-lg border shadow-sm">
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <FileTextIcon className="mr-2 h-5 w-5 text-primary" />
          Шаблоны тестов
        </h3>
        <QuizTemplateGenerator />
      </div>
    </div>
  );
}
