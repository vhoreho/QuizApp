import { ChangeEvent, useState } from "react";
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
import { FileTextIcon, ArrowRightIcon } from "@radix-ui/react-icons";
import { Spinner } from "@/components/ui/spinner";

interface QuizInfoFormProps {
  quizTitle: string;
  setQuizTitle: (title: string) => void;
  quizDescription: string;
  setQuizDescription: (description: string) => void;
  isLoading: boolean;
  onSubmit: () => void;
}

export function QuizInfoForm({
  quizTitle,
  setQuizTitle,
  quizDescription,
  setQuizDescription,
  isLoading,
  onSubmit,
}: QuizInfoFormProps) {
  return (
    <Card className="border border-border bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 shadow-md hover:shadow-lg transition-all">
      <CardHeader className="border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-full">
            <FileTextIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Базовая информация о тесте</CardTitle>
            <CardDescription>Введите название и описание теста</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-base font-medium">
              Название теста
            </Label>
            <Input
              id="title"
              placeholder="Введите название теста"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              required
              className="border-primary/20 focus:border-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-base font-medium">
              Описание теста
            </Label>
            <Textarea
              id="description"
              placeholder="Введите описание теста"
              value={quizDescription}
              onChange={(e) => setQuizDescription(e.target.value)}
              required
              className="min-h-[120px] border-primary/20 focus:border-primary"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/10 border-t pt-4">
        <Button
          onClick={onSubmit}
          disabled={!quizTitle || !quizDescription || isLoading}
          className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary ml-auto"
        >
          {isLoading ? (
            <Spinner size="sm" className="mr-2" />
          ) : (
            <ArrowRightIcon className="mr-2 h-4 w-4" />
          )}
          Создать тест и продолжить
        </Button>
      </CardFooter>
    </Card>
  );
}
