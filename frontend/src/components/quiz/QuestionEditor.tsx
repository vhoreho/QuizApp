import { useState, useEffect } from "react";
import { Question, QuestionType } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QUESTION_TYPE_CONFIG, MESSAGES } from "@/lib/constants";

interface QuestionEditorProps {
  question: Question;
  index: number;
  onUpdate: (updatedQuestion: Question) => void;
  onDelete: () => void;
}

const QuestionEditor = ({
  question,
  index,
  onUpdate,
  onDelete,
}: QuestionEditorProps) => {
  const [questionData, setQuestionData] = useState<Question>(question);

  // Update the local state when the question prop changes
  useEffect(() => {
    setQuestionData(question);
  }, [question]);

  // Update the question text
  const handleTextChange = (value: string) => {
    setQuestionData((prev) => {
      const updated = { ...prev, text: value };
      onUpdate(updated);
      return updated;
    });
  };

  // Update the question type
  const handleTypeChange = (value: string) => {
    const type = value as QuestionType;

    // Create default values based on the new type
    const options = [...QUESTION_TYPE_CONFIG[type].defaultOptions];
    const updatedQuestion: Question = {
      ...questionData,
      type,
      options,
      correctAnswers: [],
      matchingPairs: {},
    };

    setQuestionData(updatedQuestion);
    onUpdate(updatedQuestion);
  };

  // Update an option
  const handleOptionChange = (index: number, value: string) => {
    const updatedOptions = [...questionData.options];
    updatedOptions[index] = value;

    const updatedQuestion = {
      ...questionData,
      options: updatedOptions,
    };

    setQuestionData(updatedQuestion);
    onUpdate(updatedQuestion);
  };

  // Add a new option
  const handleAddOption = () => {
    const updatedQuestion = {
      ...questionData,
      options: [...questionData.options, ""],
    };

    setQuestionData(updatedQuestion);
    onUpdate(updatedQuestion);
  };

  // Toggle an option as correct (for multiple choice)
  const handleToggleCorrect = (option: string) => {
    const correctAnswers = questionData.correctAnswers || [];
    let updatedCorrectAnswers: string[];

    if (correctAnswers.includes(option)) {
      updatedCorrectAnswers = correctAnswers.filter((a) => a !== option);
    } else {
      updatedCorrectAnswers = [...correctAnswers, option];
    }

    const updatedQuestion = {
      ...questionData,
      correctAnswers: updatedCorrectAnswers,
    };

    setQuestionData(updatedQuestion);
    onUpdate(updatedQuestion);
  };

  // Set an option as correct (for single choice)
  const handleSetCorrect = (option: string) => {
    const updatedQuestion = {
      ...questionData,
      correctAnswers: [option],
    };

    setQuestionData(updatedQuestion);
    onUpdate(updatedQuestion);
  };

  // Update matching pair
  const handleMatchingPairChange = (key: string, value: string) => {
    const updatedPairs = { ...questionData.matchingPairs };
    updatedPairs[key] = value;

    const updatedQuestion = {
      ...questionData,
      matchingPairs: updatedPairs,
    };

    setQuestionData(updatedQuestion);
    onUpdate(updatedQuestion);
  };

  // Update point value
  const handlePointsChange = (value: string) => {
    const points = parseInt(value) || 1;

    const updatedQuestion = {
      ...questionData,
      points,
    };

    setQuestionData(updatedQuestion);
    onUpdate(updatedQuestion);
  };

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Вопрос {index + 1}</h3>
          <Button variant="destructive" size="sm" onClick={onDelete}>
            Удалить
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor={`question-${index}-text`}>Текст вопроса</Label>
            <Input
              id={`question-${index}-text`}
              value={questionData.text}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Введите текст вопроса"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor={`question-${index}-type`}>Тип вопроса</Label>
            <Select value={questionData.type} onValueChange={handleTypeChange}>
              <SelectTrigger id={`question-${index}-type`} className="mt-1">
                <SelectValue placeholder="Выберите тип вопроса" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(QUESTION_TYPE_CONFIG).map(([type, config]) => (
                  <SelectItem key={type} value={type}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor={`question-${index}-points`}>Баллы</Label>
            <Input
              id={`question-${index}-points`}
              type="number"
              min={1}
              value={questionData.points}
              onChange={(e) => handlePointsChange(e.target.value)}
              className="mt-1 w-24"
            />
          </div>

          {/* Render options based on question type */}
          {(questionData.type === QuestionType.SINGLE_CHOICE ||
            questionData.type === QuestionType.MULTIPLE_CHOICE ||
            questionData.type === QuestionType.TRUE_FALSE) && (
            <div className="space-y-2">
              <Label>Варианты ответов</Label>

              {questionData.options.map((option, optIndex) => (
                <div key={optIndex} className="flex items-center space-x-2">
                  <Input
                    value={option}
                    onChange={(e) =>
                      handleOptionChange(optIndex, e.target.value)
                    }
                    placeholder={`Вариант ${optIndex + 1}`}
                  />

                  {questionData.type === QuestionType.SINGLE_CHOICE ||
                  questionData.type === QuestionType.TRUE_FALSE ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetCorrect(option)}
                    >
                      {(questionData.correctAnswers || []).includes(option)
                        ? "✓ Правильный"
                        : "Сделать правильным"}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleCorrect(option)}
                    >
                      {(questionData.correctAnswers || []).includes(option)
                        ? "✓ Выбран"
                        : "Выбрать"}
                    </Button>
                  )}
                </div>
              ))}

              {questionData.type !== QuestionType.TRUE_FALSE &&
                QUESTION_TYPE_CONFIG[questionData.type].canAddOptions && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddOption}
                  >
                    Добавить вариант
                  </Button>
                )}
            </div>
          )}

          {/* Matching pairs */}
          {questionData.type === QuestionType.MATCHING && (
            <div className="space-y-2">
              <Label>Сопоставления</Label>

              {questionData.options.map((key, pIndex) => (
                <div key={pIndex} className="grid grid-cols-2 gap-2">
                  <div>
                    <Input
                      placeholder={`Ключ ${pIndex + 1}`}
                      value={key}
                      onChange={(e) =>
                        handleOptionChange(pIndex, e.target.value)
                      }
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder={`Значение ${pIndex + 1}`}
                      value={questionData.matchingPairs?.[key] || ""}
                      onChange={(e) =>
                        handleMatchingPairChange(key, e.target.value)
                      }
                    />
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddOption}
              >
                Добавить пару
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionEditor;
