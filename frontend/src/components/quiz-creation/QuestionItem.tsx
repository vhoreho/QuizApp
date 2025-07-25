import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MESSAGES, QUESTION_TYPE_CONFIG } from "@/lib/constants";
import { QuestionType } from "@/lib/types";
import { QuestionFormState } from "./types";
import { QuestionOptions } from "./QuestionOptions";

interface QuestionItemProps {
  question: QuestionFormState;
  questionIndex: number;
  onDelete: (index: number) => void;
  showDeleteButton: boolean;
  onQuestionChange: (
    index: number,
    field: keyof QuestionFormState,
    value: string
  ) => void;
  onQuestionTypeChange: (questionIndex: number, value: QuestionType) => void;
  onOptionChange: (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => void;
  onAddOption: (questionIndex: number) => void;
  onCorrectAnswerChange: (questionIndex: number, option: string) => void;
  onCorrectAnswersChange: (questionIndex: number, option: string) => void;
  onMatchingPairChange: (
    questionIndex: number,
    key: string,
    value: string
  ) => void;
  onKeyChange: (
    questionIndex: number,
    pairIndex: number,
    value: string
  ) => void;
}

export const QuestionItem = ({
  question,
  questionIndex,
  onDelete,
  showDeleteButton,
  onQuestionChange,
  onQuestionTypeChange,
  onOptionChange,
  onAddOption,
  onCorrectAnswerChange,
  onCorrectAnswersChange,
  onMatchingPairChange,
  onKeyChange,
}: QuestionItemProps) => {
  return (
    <div className="space-y-4 border-b pb-6 last:border-0">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Вопрос {questionIndex + 1}</h3>
        {showDeleteButton && (
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => onDelete(questionIndex)}
          >
            {MESSAGES.QUIZ_CREATION.DELETE_QUESTION_BUTTON}
          </Button>
        )}
      </div>
      <div>
        <Label
          htmlFor={`question-${questionIndex}-type`}
          className="mb-1 block"
        >
          {MESSAGES.QUESTION_TYPES.TYPE_LABEL}
        </Label>
        <Select
          value={question.type}
          onValueChange={(value) =>
            onQuestionTypeChange(questionIndex, value as QuestionType)
          }
        >
          <SelectTrigger id={`question-${questionIndex}-type`}>
            <SelectValue
              placeholder={MESSAGES.QUESTION_TYPES.TYPE_PLACEHOLDER}
            />
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
        <Label htmlFor={`question-${questionIndex}`}>Текст вопроса</Label>
        <Input
          id={`question-${questionIndex}`}
          placeholder={MESSAGES.QUIZ_CREATION.QUESTION_TEXT_PLACEHOLDER}
          value={question.text}
          onChange={(e) =>
            onQuestionChange(questionIndex, "text", e.target.value)
          }
          className="mt-1"
        />
      </div>
      <div className="space-y-2">
        <QuestionOptions
          questionIndex={questionIndex}
          question={question}
          onOptionChange={onOptionChange}
          onCorrectAnswerChange={onCorrectAnswerChange}
          onCorrectAnswersChange={onCorrectAnswersChange}
          onMatchingPairChange={onMatchingPairChange}
          onAddOption={onAddOption}
          onKeyChange={onKeyChange}
        />
      </div>
    </div>
  );
};
