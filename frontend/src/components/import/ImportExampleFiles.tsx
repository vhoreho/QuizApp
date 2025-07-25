import { Button } from "@/components/ui/button";
import { FileTextIcon, CopyIcon } from "@radix-ui/react-icons";
import { Download, Sparkles } from "lucide-react";
import { useState } from "react";

interface ImportExampleFilesProps {
  onDownloadExample: () => void;
}

export function ImportExampleFiles({
  onDownloadExample,
}: ImportExampleFilesProps) {
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const aiPromptTemplate = `Создай тест на тему "[ТЕМА]" с 5 вопросами.
Для каждого вопроса укажи:
- text: текст вопроса
- type: тип вопроса (SINGLE_CHOICE для одного правильного ответа, MULTIPLE_CHOICE для нескольких, TRUE_FALSE для вопросов "верно/неверно", MATCHING для сопоставления)
- options: массив вариантов ответов
- correctAnswers: массив правильных ответов (строки должны точно совпадать с вариантами из options)
- points: количество баллов за вопрос (обычно 1)

Для вопросов типа MATCHING можно добавить поле matchingPairs в формате объекта, где ключи - это элементы из левой колонки, а значения - соответствующие им элементы из правой колонки.

Оформи тест в формате JSON с полями title, description и массивом questions.
Вопросы должны быть разнообразными и интересными.`;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(aiPromptTemplate);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  return (
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
              onClick={onDownloadExample}
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

        <div className="bg-indigo-50 p-4 rounded-md border border-indigo-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              <h4 className="font-medium">Генерация с помощью ИИ</h4>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
              onClick={handleCopyPrompt}
            >
              <CopyIcon className="h-4 w-4 mr-1" />{" "}
              {copiedPrompt ? "Скопировано!" : "Копировать промпт"}
            </Button>
          </div>
          <div className="bg-indigo-900 p-3 rounded text-xs text-indigo-50 overflow-x-auto">
            <p className="whitespace-pre-line">{aiPromptTemplate}</p>
          </div>
          <div className="mt-3 text-xs text-indigo-700">
            <p>
              Используйте этот промпт в ChatGPT или другом ИИ для генерации
              теста. Замените [ТЕМА] на вашу тему.
            </p>
            <p className="mt-1">
              Полученный JSON можно сохранить в файл и импортировать в
              приложение.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
