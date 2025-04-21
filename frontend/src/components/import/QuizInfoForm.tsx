import { ChangeEvent, FormEvent } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface QuizInfoFormProps {
  title: string;
  description: string;
  onTitleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onDescriptionChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: FormEvent) => void;
  isLoading: boolean;
}

export function QuizInfoForm({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  onSubmit,
  isLoading,
}: QuizInfoFormProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Информация о тесте</CardTitle>
        <CardDescription>
          Введите название и описание вашего теста
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Название</Label>
            <Input
              id="title"
              placeholder="Введите название теста"
              value={title}
              onChange={onTitleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              placeholder="Введите описание теста"
              value={description}
              onChange={onDescriptionChange}
              required
              rows={4}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Создание..." : "Создать тест"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
