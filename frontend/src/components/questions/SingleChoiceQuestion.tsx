import { Question } from "@/lib/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SingleChoiceQuestionProps {
  question: Question;
  onAnswerSelect: (questionId: number, answer: string) => void;
  selectedAnswer?: string;
  showCorrectAnswer?: boolean;
  disabled?: boolean;
}

export function SingleChoiceQuestion({
  question,
  onAnswerSelect,
  selectedAnswer,
  showCorrectAnswer = false,
  disabled = false,
}: SingleChoiceQuestionProps) {
  const handleChange = (value: string) => {
    onAnswerSelect(question.id, value);
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
        <CardDescription>Выберите один правильный ответ</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedAnswer}
          onValueChange={handleChange}
          disabled={disabled}
        >
          <div className="grid gap-3">
            {question.options.map((option, index) => (
              <div
                key={index}
                className={`flex items-center rounded-md border p-3 
                  ${
                    isCorrectAnswer(option)
                      ? "border-green-500 bg-green-50"
                      : ""
                  } 
                  ${
                    isIncorrectSelection(option)
                      ? "border-red-500 bg-red-50"
                      : ""
                  }`}
              >
                <RadioGroupItem
                  value={option}
                  id={`option-${question.id}-${index}`}
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
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
