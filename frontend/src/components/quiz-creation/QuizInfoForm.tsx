import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MESSAGES } from "@/lib/constants";
import { QuizFormValues } from "@/lib/schemas";
import { UseFormReturn } from "react-hook-form";

interface QuizInfoFormProps {
  quizForm: UseFormReturn<QuizFormValues>;
  onSubmit: () => void;
}

export const QuizInfoForm = ({ quizForm, onSubmit }: QuizInfoFormProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{MESSAGES.QUIZ_CREATION.QUIZ_INFO_TITLE}</CardTitle>
        <CardDescription>
          {MESSAGES.QUIZ_CREATION.QUIZ_INFO_DESCRIPTION}
        </CardDescription>
      </CardHeader>
      <Form {...quizForm}>
        <form onSubmit={quizForm.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={quizForm.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        MESSAGES.QUIZ_CREATION.QUIZ_TITLE_PLACEHOLDER
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={quizForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Описание</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        MESSAGES.QUIZ_CREATION.QUIZ_DESCRIPTION_PLACEHOLDER
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit">{MESSAGES.QUIZ_CREATION.NEXT_BUTTON}</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};
