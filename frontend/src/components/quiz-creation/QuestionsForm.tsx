import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { MESSAGES } from "@/lib/constants";
import { UseFormReturn, FieldValues } from "react-hook-form";
import { QuestionFormState } from "./types";
import { QuestionItem } from "./QuestionItem";
import { QuestionType } from "@/lib/types";

interface QuestionsFormProps {
  questionsForm: UseFormReturn<any, any>;
  questions: QuestionFormState[];
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onAddQuestion: () => void;
  validateQuestions: (questions: QuestionFormState[]) => boolean;
  onDeleteQuestion: (index: number) => void;
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

export const QuestionsForm = ({
  questionsForm,
  questions,
  isSubmitting,
  onBack,
  onSubmit,
  onAddQuestion,
  validateQuestions,
  onDeleteQuestion,
  onQuestionChange,
  onQuestionTypeChange,
  onOptionChange,
  onAddOption,
  onCorrectAnswerChange,
  onCorrectAnswersChange,
  onMatchingPairChange,
  onKeyChange,
}: QuestionsFormProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{MESSAGES.QUIZ_CREATION.QUESTIONS_TITLE}</CardTitle>
        <CardDescription>
          {MESSAGES.QUIZ_CREATION.QUESTIONS_DESCRIPTION}
        </CardDescription>
      </CardHeader>
      <Form {...questionsForm}>
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-6">
            {questions.map((question, qIndex) => (
              <QuestionItem
                key={qIndex}
                question={question}
                questionIndex={qIndex}
                onDelete={onDeleteQuestion}
                showDeleteButton={questions.length > 1}
                onQuestionChange={onQuestionChange}
                onQuestionTypeChange={onQuestionTypeChange}
                onOptionChange={onOptionChange}
                onAddOption={onAddOption}
                onCorrectAnswerChange={onCorrectAnswerChange}
                onCorrectAnswersChange={onCorrectAnswersChange}
                onMatchingPairChange={onMatchingPairChange}
                onKeyChange={onKeyChange}
              />
            ))}
            <Button type="button" variant="outline" onClick={onAddQuestion}>
              {MESSAGES.QUIZ_CREATION.ADD_QUESTION_BUTTON}
            </Button>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={onBack}>
              {MESSAGES.QUIZ_CREATION.BACK_BUTTON}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !validateQuestions(questions)}
            >
              {isSubmitting
                ? MESSAGES.QUIZ_CREATION.SUBMITTING_BUTTON
                : MESSAGES.QUIZ_CREATION.SUBMIT_BUTTON}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};
