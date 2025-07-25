import { Answer } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckCircledIcon, CrossCircledIcon } from "@radix-ui/react-icons";
import { AnswerContent } from "./AnswerCards";
import { getQuestionTypeLabel } from "./utils";

interface AnswersListProps {
  answers: Answer[];
}

const AnswersList = ({ answers }: AnswersListProps) => {
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Ваши ответы</CardTitle>
        <CardDescription>
          Детали ваших ответов и правильные ответы
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" defaultValue={["item-0"]} className="w-full">
          {answers.map((answer, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex justify-between items-center w-full pr-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Вопрос {index + 1}</span>
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                      {getQuestionTypeLabel(answer.question?.type as any)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    {answer.isCorrect ? (
                      <CheckCircledIcon className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                      <CrossCircledIcon className="h-5 w-5 text-red-500 mr-2" />
                    )}
                    {answer.partialScore &&
                      answer.partialScore > 0 &&
                      !answer.isCorrect && (
                        <span className="text-xs text-amber-500 mr-2">
                          Частично верно (
                          {Math.round(answer.partialScore * 100)}%)
                        </span>
                      )}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <AnswerContent answer={answer} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default AnswersList;
