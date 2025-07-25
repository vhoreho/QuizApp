import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { QuizImportForm } from "@/components/import/QuizInfoForm";
import { toast } from "@/components/ui/use-toast";
import api from "@/api/axiosConfig";
import { ImportProcessor } from "@/components/import/ImportProcessor";
import { Button } from "@/components/ui/button";
import { Download, Copy } from "lucide-react";
import { exampleData } from "@/components/import/exampleData";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

// Helper function to download example file
const downloadExampleFile = () => {
  const jsonContent = exampleData.json;
  const blob = new Blob([jsonContent], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "example-quiz.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// AI prompt for generating a quiz
const aiPrompt = `Создай тест в формате JSON со следующей структурой:
{
  "title": "Название теста",
  "description": "Описание теста",
  "questions": [
    {
      "text": "Текст вопроса",
      "type": "SINGLE_CHOICE", // Тип вопроса (см. ниже)
      "options": ["Вариант 1", "Вариант 2", "Вариант 3", "Вариант 4"],
      "correctAnswers": ["Вариант 1"], // Для MULTIPLE_CHOICE может быть несколько правильных ответов
      "points": 1
    }
  ]
}

Поддерживаемые типы вопросов:
- SINGLE_CHOICE: один правильный ответ из нескольких вариантов
- MULTIPLE_CHOICE: несколько правильных ответов из предложенных вариантов
- TRUE_FALSE: вопрос с ответом "Верно" или "Неверно"
- MATCHING: сопоставление элементов (пары ключ:значение)

Пример вопроса с одним правильным ответом (SINGLE_CHOICE):
{
  "text": "Какая планета находится ближе всего к Солнцу?",
  "type": "SINGLE_CHOICE",
  "options": ["Меркурий", "Венера", "Земля", "Марс"],
  "correctAnswers": ["Меркурий"],
  "points": 1
}

Пример вопроса с несколькими правильными ответами (MULTIPLE_CHOICE):
{
  "text": "Какие из перечисленных языков относятся к функциональным?",
  "type": "MULTIPLE_CHOICE",
  "options": ["JavaScript", "Haskell", "C++", "Lisp"],
  "correctAnswers": ["Haskell", "Lisp"],
  "points": 2
}

Пример вопроса TRUE_FALSE:
{
  "text": "HTML - это язык программирования.",
  "type": "TRUE_FALSE",
  "options": ["Верно", "Неверно"],
  "correctAnswers": ["Неверно"],
  "points": 1
}

Пример вопроса MATCHING (сопоставление):
{
  "text": "Сопоставьте языки программирования и их создателей:",
  "type": "MATCHING",
  "options": ["JavaScript:Брендан Эйх", "Python:Гвидо ван Россум", "C++:Бьёрн Страуструп", "Java:Джеймс Гослинг"],
  "correctAnswers": ["JavaScript:Брендан Эйх", "Python:Гвидо ван Россум", "C++:Бьёрн Страуструп", "Java:Джеймс Гослинг"],
  "points": 2
}

Создай тест на тему [УКАЖИТЕ ТЕМУ] с 5-10 вопросами разного типа.`;

export default function ImportQuizPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState("");
  const [importStep, setImportStep] = useState(0);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Скопировано!",
        description: "Промпт для ИИ скопирован в буфер обмена",
      });
    } catch (err) {
      console.error("Не удалось скопировать текст: ", err);
    }
  };

  const handleImport = async (data: any) => {
    // Проверка наличия файла
    if (!data.file) {
      toast({
        title: "Ошибка!",
        description: "Выберите файл для импорта",
        variant: "destructive",
      });
      return;
    }

    // Используем ImportProcessor для обработки импорта
    const { importQuiz } = ImportProcessor({
      file: data.file,
      title: "", // Будет взято из файла
      description: "", // Будет взято из файла
      subjectId: data.subjectId,
      onImportStart: () => {
        setIsLoading(true);
      },
      onProgress: (progress, status, step) => {
        setImportProgress(progress);
        setImportStatus(status);
        setImportStep(step);
      },
      onSuccess: (title, description, questions) => {
        toast({
          title: "Успех!",
          description: `Тест "${title}" успешно импортирован с ${questions.length} вопросами`,
        });
        setIsLoading(false);
        navigate("/teacher/quizzes");
      },
      onError: (error) => {
        toast({
          title: "Ошибка!",
          description: error,
          variant: "destructive",
        });
        setIsLoading(false);
      },
    });

    // Запускаем процесс импорта
    importQuiz();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Импорт теста</h1>
        </div>

        {importStep > 0 && (
          <div className="mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-800">
                Прогресс импорта: {importProgress}%
              </h3>
              <p className="text-blue-600">{importStatus}</p>
              <div className="w-full bg-blue-200 rounded-full h-2.5 mt-2">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${importProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <QuizImportForm onSubmit={handleImport} isLoading={isLoading} />
          </div>

          <div className="lg:col-span-2">
            <Tabs defaultValue="example" className="h-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="example">Пример файла</TabsTrigger>
                <TabsTrigger value="ai">Промпт для ИИ</TabsTrigger>
              </TabsList>

              <TabsContent value="example" className="mt-4 h-full">
                <Card className="h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">
                      Пример структуры файла
                    </CardTitle>
                    <CardDescription>
                      Скачайте пример и используйте его как шаблон
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-slate-100 p-3 rounded-md text-xs overflow-auto max-h-[400px]">
                      {JSON.stringify(JSON.parse(exampleData.json), null, 2)}
                    </pre>
                    <Button
                      variant="outline"
                      onClick={downloadExampleFile}
                      className="flex items-center gap-2 mt-3 w-full"
                    >
                      <Download size={16} />
                      Скачать пример
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ai" className="mt-4 h-full">
                <Card className="h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Промпт для ИИ</CardTitle>
                    <CardDescription>
                      Скопируйте этот промпт и отправьте его ChatGPT или другому
                      ИИ
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      className="min-h-[400px] text-sm font-mono"
                      value={aiPrompt}
                      readOnly
                    />
                    <Button
                      variant="outline"
                      onClick={() => copyToClipboard(aiPrompt)}
                      className="flex items-center gap-2 mt-3 w-full"
                    >
                      <Copy size={16} />
                      Копировать промпт
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
