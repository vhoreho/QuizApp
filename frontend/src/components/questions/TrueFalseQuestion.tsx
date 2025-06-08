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

export function TrueFalseQuestion({
  question,
  onAnswerSelect,
  selectedAnswer,
  showCorrectAnswer = false,
  disabled = false,
}: TrueFalseQuestionProps) {
  const options = ["Правда", "Ложь"];

  const handleSelect = (option: string) => {
    onAnswerSelect(question.id, option);
  };

  const isCorrectAnswer = (option: string) => {
    if (!showCorrectAnswer || !question.correctAnswers) return false;
    return question.correctAnswers.includes(option);
  };

  const isIncorrectSelection = (option: string) => {
    if (!showCorrectAnswer || !selectedAnswer) return false;
    return selectedAnswer === option && !isCorrectAnswer(option);
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
          {options.map((option, index) => (
            <Button
              key={index}
              variant={selectedAnswer === option ? "default" : "outline"}
              onClick={() => handleSelect(option)}
              disabled={disabled}
              className={`flex-1 ${
                isCorrectAnswer(option)
                  ? "border-green-500 bg-green-50 hover:bg-green-50"
                  : ""
              } 
                ${
                  isIncorrectSelection(option)
                    ? "border-red-500 bg-red-50 hover:bg-red-50"
                    : ""
                }`}
            >
              {option}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
