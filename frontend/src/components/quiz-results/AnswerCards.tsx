import { Answer } from "@/lib/types";

interface SingleChoiceAnswerProps {
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export const SingleChoiceAnswer = ({
  userAnswer,
  correctAnswer,
  isCorrect,
}: SingleChoiceAnswerProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
      <div>
        <div className="text-sm text-muted-foreground mb-1">Ваш ответ:</div>
        <div
          className={`p-2 rounded ${
            isCorrect
              ? "bg-green-100 dark:bg-green-900/20"
              : "bg-red-100 dark:bg-red-900/20"
          }`}
        >
          {userAnswer}
        </div>
      </div>
      <div>
        <div className="text-sm text-muted-foreground mb-1">
          Правильный ответ:
        </div>
        <div className="p-2 rounded bg-green-100 dark:bg-green-900/20">
          {correctAnswer}
        </div>
      </div>
    </div>
  );
};

interface MultipleChoiceAnswerProps {
  selectedAnswers?: string[];
  correctAnswers: string[];
}

export const MultipleChoiceAnswer = ({
  selectedAnswers = [],
  correctAnswers,
}: MultipleChoiceAnswerProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
      <div>
        <div className="text-sm text-muted-foreground mb-1">Ваш ответ:</div>
        <div className="space-y-1">
          {selectedAnswers.map((selected, i) => (
            <div
              key={i}
              className={`p-2 rounded ${
                correctAnswers.includes(selected)
                  ? "bg-green-100 dark:bg-green-900/20"
                  : "bg-red-100 dark:bg-red-900/20"
              }`}
            >
              {selected}
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="text-sm text-muted-foreground mb-1">
          Правильный ответ:
        </div>
        <div className="space-y-1">
          {correctAnswers.map((correct, i) => (
            <div
              key={i}
              className="p-2 rounded bg-green-100 dark:bg-green-900/20"
            >
              {correct}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface MatchingAnswerProps {
  matchingPairs?: { [key: string]: string };
  options: string[];
  correctAnswers: string[];
}

export const MatchingAnswer = ({
  matchingPairs = {},
  options,
  correctAnswers,
}: MatchingAnswerProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
      <div>
        <div className="text-sm text-muted-foreground mb-1">Ваш ответ:</div>
        <div className="space-y-1">
          {Object.entries(matchingPairs).map(([key, value], i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="p-2 rounded bg-muted flex-1">{key}</div>
              <span>➝</span>
              <div
                className={`p-2 rounded flex-1 ${
                  correctAnswers[options.indexOf(key)] === value
                    ? "bg-green-100 dark:bg-green-900/20"
                    : "bg-red-100 dark:bg-red-900/20"
                }`}
              >
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="text-sm text-muted-foreground mb-1">
          Правильный ответ:
        </div>
        <div className="space-y-1">
          {options.map((key, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="p-2 rounded bg-muted flex-1">{key}</div>
              <span>➝</span>
              <div className="p-2 rounded bg-green-100 dark:bg-green-900/20 flex-1">
                {correctAnswers[i]}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface AnswerContentProps {
  answer: Answer;
}

export const AnswerContent = ({ answer }: AnswerContentProps) => {
  const question = answer.question;

  if (!question) {
    return <div>Информация о вопросе недоступна</div>;
  }

  return (
    <div className="space-y-3 pl-6 pr-2">
      <p className="font-medium">{question.text}</p>

      {/* Отображение ответа в зависимости от типа вопроса */}
      {question.type === "SINGLE_CHOICE" || question.type === "TRUE_FALSE" ? (
        <SingleChoiceAnswer
          userAnswer={answer.selectedAnswer || ""}
          correctAnswer={question.correctAnswers?.[0] || ""}
          isCorrect={!!answer.isCorrect}
        />
      ) : question.type === "MULTIPLE_CHOICE" ? (
        <MultipleChoiceAnswer
          selectedAnswers={answer.selectedAnswers}
          correctAnswers={question.correctAnswers || []}
        />
      ) : question.type === "MATCHING" ? (
        <MatchingAnswer
          matchingPairs={answer.matchingPairs}
          options={question.options}
          correctAnswers={question.correctAnswers || []}
        />
      ) : (
        <div className="p-2 bg-muted rounded">
          Формат ответа не поддерживается
        </div>
      )}
    </div>
  );
};
