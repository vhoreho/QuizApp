import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DownloadIcon,
  InfoCircledIcon,
  TableIcon,
  FileTextIcon,
} from "@radix-ui/react-icons";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QuestionType } from "@/lib/types";

export default function QuizTemplateGenerator() {
  const [questionCount, setQuestionCount] = useState(5);

  // Генерация CSV-шаблона
  const generateCsvTemplate = () => {
    // Создаем заголовок CSV
    let csvContent = "Название теста,Описание теста,30\n";

    // Добавляем примеры вопросов
    for (let i = 1; i <= questionCount; i++) {
      let questionType =
        i % 4 === 0
          ? "true_false"
          : i % 3 === 0
          ? "matching"
          : i % 2 === 0
          ? "multiple"
          : "single";

      if (questionType === "single") {
        csvContent += `Пример вопроса с одиночным выбором №${i},single,1,Правильный ответ,Правильный ответ,Вариант 2,Вариант 3\n`;
      } else if (questionType === "multiple") {
        csvContent += `Пример вопроса с множественным выбором №${i},multiple,2,Правильный ответ 1,Правильный ответ 1,Правильный ответ 2,Вариант 3\n`;
      } else if (questionType === "true_false") {
        csvContent += `Пример вопроса верно/неверно №${i},true_false,1,Да,Да,Нет\n`;
      } else if (questionType === "matching") {
        csvContent += `Пример вопроса на сопоставление №${i},matching,3,A-1|B-2|C-3,A,B,C,1,2,3\n`;
      }
    }

    downloadFile(csvContent, "quiz_template.csv", "text/csv");
  };

  // Генерация JSON-шаблона
  const generateJsonTemplate = () => {
    const quizTemplate = {
      title: "Название теста",
      description: "Описание теста",
      timeLimit: 30,
      questions: [] as any[],
    };

    // Добавляем примеры вопросов
    for (let i = 1; i <= questionCount; i++) {
      let questionType =
        i % 4 === 0
          ? QuestionType.TRUE_FALSE
          : i % 3 === 0
          ? QuestionType.MATCHING
          : i % 2 === 0
          ? QuestionType.MULTIPLE_CHOICE
          : QuestionType.SINGLE_CHOICE;

      if (questionType === QuestionType.SINGLE_CHOICE) {
        quizTemplate.questions.push({
          text: `Пример вопроса с одиночным выбором №${i}`,
          type: QuestionType.SINGLE_CHOICE,
          options: ["Правильный ответ", "Вариант 2", "Вариант 3"],
          correctAnswers: ["Правильный ответ"],
          points: 1,
          order: i,
        });
      } else if (questionType === QuestionType.MULTIPLE_CHOICE) {
        quizTemplate.questions.push({
          text: `Пример вопроса с множественным выбором №${i}`,
          type: QuestionType.MULTIPLE_CHOICE,
          options: ["Правильный ответ 1", "Правильный ответ 2", "Вариант 3"],
          correctAnswers: ["Правильный ответ 1", "Правильный ответ 2"],
          points: 2,
          order: i,
        });
      } else if (questionType === QuestionType.TRUE_FALSE) {
        quizTemplate.questions.push({
          text: `Пример вопроса верно/неверно №${i}`,
          type: QuestionType.TRUE_FALSE,
          options: ["Да", "Нет"],
          correctAnswers: ["Да"],
          points: 1,
          order: i,
        });
      } else if (questionType === QuestionType.MATCHING) {
        quizTemplate.questions.push({
          text: `Пример вопроса на сопоставление №${i}`,
          type: QuestionType.MATCHING,
          options: ["A", "B", "C", "1", "2", "3"],
          matchingPairs: { A: "1", B: "2", C: "3" },
          points: 3,
          order: i,
        });
      }
    }

    const jsonContent = JSON.stringify(quizTemplate, null, 2);
    downloadFile(jsonContent, "quiz_template.json", "application/json");
  };

  // Функция для скачивания файла
  const downloadFile = (
    content: string,
    fileName: string,
    contentType: string
  ) => {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Шаблоны для импорта</CardTitle>
        <CardDescription>
          Скачайте шаблоны для создания тестов в Excel, CSV или JSON формате
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <InfoCircledIcon className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-sm text-blue-700 dark:text-blue-300">
            Скачайте шаблон, заполните его своими данными и импортируйте обратно
            в систему.
          </AlertDescription>
        </Alert>

        <div className="my-4 space-y-2">
          <Label htmlFor="questionCount">Количество примеров вопросов</Label>
          <Input
            id="questionCount"
            type="number"
            min="1"
            max="20"
            value={questionCount}
            onChange={(e) => setQuestionCount(parseInt(e.target.value) || 5)}
          />
        </div>

        <Tabs defaultValue="csv" className="mt-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="csv">CSV</TabsTrigger>
            <TabsTrigger value="json">JSON</TabsTrigger>
          </TabsList>
          <TabsContent
            value="csv"
            className="p-4 border rounded-md mt-2 bg-muted/20"
          >
            <h3 className="text-lg font-medium mb-2 flex items-center">
              <TableIcon className="h-4 w-4 mr-2 text-muted-foreground" />
              CSV шаблон
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              CSV формат удобен для создания в Excel или других табличных
              редакторах.
            </p>
            <pre className="text-xs p-3 bg-muted rounded-md overflow-x-auto">
              Название теста,Описание,30
              <br />
              Вопрос 1,single,1,Правильный ответ,Правильный ответ,Вариант
              2,Вариант 3<br />
              Вопрос 2,multiple,2,Вариант 1,Вариант 1,Вариант 2,Вариант 3
            </pre>
          </TabsContent>
          <TabsContent
            value="json"
            className="p-4 border rounded-md mt-2 bg-muted/20"
          >
            <h3 className="text-lg font-medium mb-2 flex items-center">
              <FileTextIcon className="h-4 w-4 mr-2 text-muted-foreground" />
              JSON шаблон
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              JSON формат содержит полную структуру данных и подходит для
              программной генерации.
            </p>
            <pre className="text-xs p-3 bg-muted rounded-md overflow-x-auto">
              &#123;
              <br />
              &nbsp;&nbsp;"title": "Название теста",
              <br />
              &nbsp;&nbsp;"description": "Описание теста",
              <br />
              &nbsp;&nbsp;"questions": [<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&#123;
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"text": "Текст вопроса",
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"type": "SINGLE_CHOICE",
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"options": ["Вариант 1",
              "Вариант 2"],
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"correctAnswers": ["Вариант
              1"]
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;&#125;
              <br />
              &nbsp;&nbsp;]
              <br />
              &#125;
            </pre>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 sm:flex-row">
        <Button
          variant="outline"
          className="w-full sm:w-auto"
          onClick={generateCsvTemplate}
        >
          <DownloadIcon className="mr-2 h-4 w-4" />
          Скачать CSV шаблон
        </Button>
        <Button
          variant="outline"
          className="w-full sm:w-auto"
          onClick={generateJsonTemplate}
        >
          <DownloadIcon className="mr-2 h-4 w-4" />
          Скачать JSON шаблон
        </Button>
      </CardFooter>
    </Card>
  );
}
