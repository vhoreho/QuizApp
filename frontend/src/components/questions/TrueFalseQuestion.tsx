import React from "react";
import { Question } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface TrueFalseQuestionProps {
  question: Question;
  onAnswerSelect: (questionId: number, answer: string) => void;
  selectedAnswer?: string;
  showCorrectAnswer?: boolean;
  disabled?: boolean;
}

const TRUE_FALSE_OPTIONS = [
  { value: "true", label: "Правда" },
  { value: "false", label: "Ложь" },
];

export function TrueFalseQuestion({
  question,
  onAnswerSelect,
  selectedAnswer,
  showCorrectAnswer = false,
  disabled = false,
}: TrueFalseQuestionProps) {
  const handleSelect = (value: string) => {
    onAnswerSelect(question.id, value);
  };

  const isCorrectAnswer = (value: string) => {
    if (!showCorrectAnswer || !question.correctAnswers) return false;
    return question.correctAnswers.includes(value);
  };

  const isIncorrectSelection = (value: string) => {
    if (!showCorrectAnswer || !selectedAnswer) return false;
    return selectedAnswer === value && !isCorrectAnswer(value);
  };

  const getDisplayValue = (value: string) => {
    return (
      TRUE_FALSE_OPTIONS.find((option) => option.value === value)?.label ||
      value
    );
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{question.text}</span>
          {question.points > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              {question.points} {question.points === 1 ? "балл" : "баллов"}
            </span>
          )}
        </CardTitle>
        <CardDescription>Определите, верно ли утверждение</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          {TRUE_FALSE_OPTIONS.map(({ value, label }) => (
            <Button
              key={value}
              variant={selectedAnswer === value ? "default" : "outline"}
              onClick={() => handleSelect(value)}
              disabled={disabled}
              className={`flex-1 ${
                isCorrectAnswer(value)
                  ? "border-green-500 bg-green-50 hover:bg-green-50"
                  : ""
              } 
                ${
                  isIncorrectSelection(value)
                    ? "border-red-500 bg-red-50 hover:bg-red-50"
                    : ""
                }`}
            >
              {label}
            </Button>
          ))}
        </div>
        {showCorrectAnswer && selectedAnswer && (
          <div className="mt-4 text-sm">
            <span
              className={
                isCorrectAnswer(selectedAnswer)
                  ? "text-green-600"
                  : "text-red-600"
              }
            >
              Ваш ответ: {getDisplayValue(selectedAnswer)}
            </span>
            {!isCorrectAnswer(selectedAnswer) && (
              <span className="text-green-600 ml-2">
                • Правильный ответ:{" "}
                {getDisplayValue(question.correctAnswers[0])}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
