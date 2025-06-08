import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MESSAGES } from "@/lib/constants";
import { QuestionType } from "@/lib/types";
import { QuestionFormState } from "./types";

interface QuestionOptionsProps {
  questionIndex: number;
  question: QuestionFormState;
  onOptionChange: (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => void;
  onCorrectAnswerChange: (questionIndex: number, option: string) => void;
  onCorrectAnswersChange: (questionIndex: number, option: string) => void;
  onMatchingPairChange: (
    questionIndex: number,
    key: string,
    value: string
  ) => void;
  onAddOption: (questionIndex: number) => void;
  onKeyChange: (
    questionIndex: number,
    pairIndex: number,
    value: string
  ) => void;
}

export const QuestionOptions = ({
  questionIndex,
  question,
  onOptionChange,
  onCorrectAnswerChange,
  onCorrectAnswersChange,
  onMatchingPairChange,
  onAddOption,
  onKeyChange,
}: QuestionOptionsProps) => {
  if (
    question.type === QuestionType.SINGLE_CHOICE ||
    question.type === QuestionType.MULTIPLE_CHOICE ||
    question.type === QuestionType.TRUE_FALSE
  ) {
    return (
      <>
        {question.options.map((option, oIndex) => (
          <div key={oIndex} className="flex items-center space-x-2">
            <Input
              placeholder={MESSAGES.QUESTION_TYPES.OPTION_PLACEHOLDER(oIndex)}
              value={option}
              onChange={(e) =>
                onOptionChange(questionIndex, oIndex, e.target.value)
              }
            />
            {question.type === QuestionType.SINGLE_CHOICE ||
            question.type === QuestionType.TRUE_FALSE ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onCorrectAnswerChange(questionIndex, option)}
              >
                {question.correctAnswer === option
                  ? MESSAGES.QUESTION_TYPES.IS_CORRECT_BUTTON
                  : MESSAGES.QUESTION_TYPES.MARK_CORRECT_BUTTON}
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onCorrectAnswersChange(questionIndex, option)}
              >
                {question.correctAnswers?.includes(option)
                  ? MESSAGES.QUESTION_TYPES.IS_SELECTED_BUTTON
                  : MESSAGES.QUESTION_TYPES.SELECT_BUTTON}
              </Button>
            )}
          </div>
        ))}
        {question.type !== QuestionType.TRUE_FALSE && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onAddOption(questionIndex)}
          >
            {MESSAGES.QUESTION_TYPES.ADD_OPTION_BUTTON}
          </Button>
        )}
      </>
    );
  }

  if (question.type === QuestionType.MATCHING) {
    return (
      <>
        {question.options.map((key, pIndex) => (
          <div key={pIndex} className="grid grid-cols-2 gap-2">
            <div>
              <Input
                placeholder={MESSAGES.QUESTION_TYPES.KEY_PLACEHOLDER(pIndex)}
                value={key}
                onChange={(e) =>
                  onKeyChange(questionIndex, pIndex, e.target.value)
                }
              />
            </div>
            <div className="flex items-center space-x-2">
              <Input
                placeholder={MESSAGES.QUESTION_TYPES.VALUE_PLACEHOLDER(pIndex)}
                value={question.matchingPairs?.[key] || ""}
                onChange={(e) =>
                  onMatchingPairChange(questionIndex, key, e.target.value)
                }
              />
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onAddOption(questionIndex)}
        >
          {MESSAGES.QUESTION_TYPES.ADD_PAIR_BUTTON}
        </Button>
      </>
    );
  }

  return null;
};
