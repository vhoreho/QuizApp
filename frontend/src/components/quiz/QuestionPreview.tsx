import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileTextIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  EyeOpenIcon,
  CheckCircledIcon,
  Cross2Icon,
} from "@radix-ui/react-icons";
import { QuestionType, Quiz } from "@/lib/types";
import { Spinner } from "@/components/ui/spinner";

interface QuestionPreviewProps {
  previewData: Quiz | null;
  isLoading: boolean;
  onBack: () => void;
  onSubmit: () => void;
}

export function QuestionPreview({
  previewData,
  isLoading,
  onBack,
  onSubmit,
}: QuestionPreviewProps) {
  return (
    <Card className="border border-border bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 shadow-md hover:shadow-lg transition-all">
      <CardHeader className="border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="bg-amber-100 dark:bg-amber-900 p-2 rounded-full">
            <EyeOpenIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <CardTitle>Предпросмотр вопросов</CardTitle>
            <CardDescription>
              {previewData
                ? `Найдено ${previewData.questions?.length || 0} вопросов`
                : "Загрузите файл или введите данные для предпросмотра"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="max-h-[500px] overflow-y-auto pt-6">
        {previewData ? (
          <div className="space-y-6">
            {previewData.questions &&
              previewData.questions.map((question, index) => (
                <div
                  key={index}
                  className="p-5 border rounded-lg bg-white dark:bg-card hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 rounded-full p-2 flex-shrink-0 
                      ${
                        question.type === QuestionType.SINGLE_CHOICE
                          ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                          : question.type === QuestionType.MULTIPLE_CHOICE
                          ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400"
                          : question.type === QuestionType.MATCHING
                          ? "bg-violet-100 text-violet-600 dark:bg-violet-900 dark:text-violet-400"
                          : "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-400"
                      }`}
                    >
                      {question.type === QuestionType.SINGLE_CHOICE && (
                        <CheckCircledIcon className="h-5 w-5" />
                      )}
                      {question.type === QuestionType.MULTIPLE_CHOICE && (
                        <CheckCircledIcon className="h-5 w-5" />
                      )}
                      {question.type === QuestionType.MATCHING && (
                        <FileTextIcon className="h-5 w-5" />
                      )}
                      {question.type === QuestionType.TRUE_FALSE && (
                        <CheckCircledIcon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-base mb-2">
                        {question.text}
                      </h3>
                      <div className="flex items-center gap-2 mb-3">
                        <div
                          className={`text-xs px-2 py-1 rounded-full font-medium
                          ${
                            question.type === QuestionType.SINGLE_CHOICE
                              ? "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
                              : question.type === QuestionType.MULTIPLE_CHOICE
                              ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400"
                              : question.type === QuestionType.MATCHING
                              ? "bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400"
                              : "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
                          }`}
                        >
                          {question.type}
                        </div>
                        <div className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                          {question.points}{" "}
                          {question.points === 1
                            ? "балл"
                            : question.points < 5
                            ? "балла"
                            : "баллов"}
                        </div>
                      </div>
                      {question.options && (
                        <div className="mb-2">
                          <p className="text-sm mb-2 text-muted-foreground">
                            Варианты ответов:
                          </p>
                          <ul className="space-y-1.5">
                            {question.options.map((option, idx) => (
                              <li
                                key={idx}
                                className="flex items-center gap-2 text-sm border border-muted/40 rounded-md p-2 bg-muted/5"
                              >
                                <div
                                  className={`w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0
                                  ${
                                    question.correctAnswers?.includes(option)
                                      ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
                                      : "bg-muted text-muted-foreground"
                                  }`}
                                >
                                  {question.correctAnswers?.includes(option) ? (
                                    <CheckCircledIcon className="h-4 w-4" />
                                  ) : (
                                    <span className="text-xs">{idx + 1}</span>
                                  )}
                                </div>
                                <span
                                  className={
                                    question.correctAnswers?.includes(option)
                                      ? "font-medium text-green-700 dark:text-green-400"
                                      : ""
                                  }
                                >
                                  {option}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            <div className="bg-muted/20 mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-4">
              <Cross2Icon className="h-8 w-8 text-muted-foreground/60" />
            </div>
            <p className="text-lg font-medium">Нет данных для предпросмотра</p>
            <p className="text-sm mt-1">
              Загрузите файл с вопросами или введите данные
            </p>
          </div>
        )}
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
        <Button
          onClick={onSubmit}
          disabled={!previewData || !previewData.questions?.length || isLoading}
          className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white"
        >
          {isLoading ? (
            <Spinner size="sm" className="mr-2" />
          ) : (
            <ArrowRightIcon className="mr-2 h-4 w-4" />
          )}
          Добавить вопросы
        </Button>
      </CardFooter>
    </Card>
  );
}
