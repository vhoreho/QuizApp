import React from "react";
import { Question, QuestionType, Answer } from "@/lib/types";
import { SingleChoiceQuestion } from "./SingleChoiceQuestion";
import { MultipleChoiceQuestion } from "./MultipleChoiceQuestion";
import { MatchingQuestion } from "./MatchingQuestion";
import { TrueFalseQuestion } from "./TrueFalseQuestion";

interface QuestionRendererProps {
  question: Question;
  onAnswerSelect: (answer: Answer) => void;
  currentAnswer?: Answer;
  showCorrectAnswer?: boolean;
  disabled?: boolean;
}

export function QuestionRenderer({
  question,
  onAnswerSelect,
  currentAnswer,
  showCorrectAnswer = false,
  disabled = false,
}: QuestionRendererProps) {
  // Обработчики для разных типов вопросов
  const handleSingleChoiceAnswer = (questionId: number, answer: string) => {
    onAnswerSelect({
      questionId,
      questionType: QuestionType.SINGLE_CHOICE,
      selectedAnswer: answer,
    });
  };

  const handleMultipleChoiceAnswer = (
    questionId: number,
    answers: string[]
  ) => {
    onAnswerSelect({
      questionId,
      questionType: QuestionType.MULTIPLE_CHOICE,
      selectedAnswers: answers,
    });
  };

  const handleMatchingAnswer = (
    questionId: number,
    matches: { [key: string]: string }
  ) => {
    onAnswerSelect({
      questionId,
      questionType: QuestionType.MATCHING,
      matchingPairs: matches,
    });
  };

  const handleTrueFalseAnswer = (questionId: number, answer: string) => {
    onAnswerSelect({
      questionId,
      questionType: QuestionType.TRUE_FALSE,
      selectedAnswer: answer,
    });
  };

  // Выбор компонента в зависимости от типа вопроса
  switch (question.type) {
    case QuestionType.SINGLE_CHOICE:
      return (
        <SingleChoiceQuestion
          question={question}
          onAnswerSelect={handleSingleChoiceAnswer}
          selectedAnswer={currentAnswer?.selectedAnswer}
          showCorrectAnswer={showCorrectAnswer}
          disabled={disabled}
        />
      );
    case QuestionType.MULTIPLE_CHOICE:
      return (
        <MultipleChoiceQuestion
          question={question}
          onAnswerSelect={handleMultipleChoiceAnswer}
          selectedAnswers={currentAnswer?.selectedAnswers}
          showCorrectAnswer={showCorrectAnswer}
          disabled={disabled}
        />
      );
    case QuestionType.MATCHING:
      return (
        <MatchingQuestion
          question={question}
          onAnswerSelect={handleMatchingAnswer}
          selectedMatches={currentAnswer?.matchingPairs}
          showCorrectAnswer={showCorrectAnswer}
          disabled={disabled}
        />
      );
    case QuestionType.TRUE_FALSE:
      return (
        <TrueFalseQuestion
          question={question}
          onAnswerSelect={handleTrueFalseAnswer}
          selectedAnswer={currentAnswer?.selectedAnswer}
          showCorrectAnswer={showCorrectAnswer}
          disabled={disabled}
        />
      );
    default:
      return <div>Неподдерживаемый тип вопроса</div>;
  }
}
