import React, { useState, useEffect } from "react";
import { Question } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface MatchingQuestionProps {
  question: Question;
  onAnswerSelect: (
    questionId: number,
    matches: { [key: string]: string }
  ) => void;
  selectedMatches?: { [key: string]: string };
  showCorrectAnswer?: boolean;
  disabled?: boolean;
}

export function MatchingQuestion({
  question,
  onAnswerSelect,
  selectedMatches = {},
  showCorrectAnswer = false,
  disabled = false,
}: MatchingQuestionProps) {
  const [matches, setMatches] = useState<{ [key: string]: string }>(
    selectedMatches
  );
  const options = question.options;
  const correctAnswers = question.correctAnswers || [];

  // Перемешиваем варианты ответов для отображения
  const [shuffledAnswers, setShuffledAnswers] = useState<string[]>([]);

  useEffect(() => {
    if (correctAnswers.length > 0) {
      // Клонируем и перемешиваем массив правильных ответов
      const shuffled = [...correctAnswers].sort(() => Math.random() - 0.5);
      setShuffledAnswers(shuffled);
    }
  }, [correctAnswers]);

  const handleChange = (key: string, value: string) => {
    const newMatches = { ...matches, [key]: value };
    setMatches(newMatches);
    onAnswerSelect(question.id, newMatches);
  };

  const isCorrectMatch = (key: string, value: string) => {
    if (!showCorrectAnswer || !question.correctAnswers) return false;
    const keyIndex = options.indexOf(key);
    return (
      keyIndex >= 0 &&
      keyIndex < correctAnswers.length &&
      correctAnswers[keyIndex] === value
    );
  };

  const isIncorrectMatch = (key: string, value: string) => {
    if (!showCorrectAnswer || value === undefined) return false;
    return !isCorrectMatch(key, value);
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
        <CardDescription>
          Сопоставьте элементы из левой колонки с элементами правой колонки
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {options.map((key, index) => (
            <div
              key={index}
              className="grid grid-cols-[1fr,auto,1fr] items-center gap-2"
            >
              <div className="rounded-md border p-3">{key}</div>
              <div>→</div>
              <div
                className={`rounded-md border p-1 
                ${
                  isCorrectMatch(key, matches[key])
                    ? "border-green-500 bg-green-50"
                    : ""
                } 
                ${
                  isIncorrectMatch(key, matches[key])
                    ? "border-red-500 bg-red-50"
                    : ""
                }`}
              >
                <Select
                  value={matches[key] || ""}
                  onValueChange={(value) => handleChange(key, value)}
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите соответствие" />
                  </SelectTrigger>
                  <SelectContent>
                    {shuffledAnswers.map((answer, i) => (
                      <SelectItem key={i} value={answer}>
                        {answer}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {showCorrectAnswer && correctAnswers[index] && (
                <div className="text-sm text-green-600 mt-1">
                  Правильный ответ: {correctAnswers[index]}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
