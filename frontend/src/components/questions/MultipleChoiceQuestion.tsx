import React, { useState } from "react";
import { Question } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface MultipleChoiceQuestionProps {
  question: Question;
  onAnswerSelect: (questionId: number, answers: string[]) => void;
  selectedAnswers?: string[];
  showCorrectAnswer?: boolean;
  disabled?: boolean;
}

export function MultipleChoiceQuestion({
  question,
  onAnswerSelect,
  selectedAnswers = [],
  showCorrectAnswer = false,
  disabled = false,
}: MultipleChoiceQuestionProps) {
  const handleChange = (option: string, checked: boolean) => {
    let newSelected = [...selectedAnswers];
    if (checked) {
      newSelected.push(option);
    } else {
      newSelected = newSelected.filter((o) => o !== option);
    }
    onAnswerSelect(question.id, newSelected);
  };

  const isCorrectAnswer = (option: string) => {
    if (!showCorrectAnswer || !question.correctAnswers) return false;
    return question.correctAnswers.includes(option);
  };

  const isIncorrectSelection = (option: string) => {
    if (!showCorrectAnswer || !selectedAnswers) return false;
    return selectedAnswers.includes(option) && !isCorrectAnswer(option);
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
        <CardDescription>Выберите все правильные ответы</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {question.options.map((option, index) => (
            <div
              key={index}
              className={`flex items-center rounded-md border p-3 
                ${
                  isCorrectAnswer(option) && showCorrectAnswer
                    ? "border-green-500 bg-green-50"
                    : ""
                } 
                ${
                  isIncorrectSelection(option) ? "border-red-500 bg-red-50" : ""
                }`}
            >
              <Checkbox
                id={`option-${question.id}-${index}`}
                checked={selectedAnswers.includes(option)}
                onCheckedChange={(checked) =>
                  handleChange(option, checked as boolean)
                }
                disabled={disabled}
                className="mr-3"
              />
              <Label
                htmlFor={`option-${question.id}-${index}`}
                className="w-full cursor-pointer"
              >
                {option}
              </Label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
