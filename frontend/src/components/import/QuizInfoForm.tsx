import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/axiosConfig";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

const formSchema = z.object({
  subjectId: z.string().min(1, "Выберите предмет"),
  file: z.instanceof(File, { message: "Выберите файл" }),
});

interface QuizImportFormProps {
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export function QuizImportForm({ onSubmit, isLoading }: QuizImportFormProps) {
  // Получаем список предметов
  const { data: subjects = [], isLoading: isSubjectsLoading } = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const response = await api.get("/subjects");
      return response.data;
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subjectId: "",
    },
    mode: "onChange",
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit({
      ...values,
      subjectId: parseInt(values.subjectId),
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card className="p-4 bg-blue-50 border-blue-200">
          <CardContent className="p-0">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-800">Важно</h3>
                <p className="text-sm text-blue-600 mt-1">
                  Заголовок и описание теста будут взяты из импортируемого
                  файла. Файл должен содержать поля <code>title</code>,{" "}
                  <code>description</code> и массив <code>questions</code>.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <FormField
          control={form.control}
          name="file"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>Файл с тестом</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onChange(file);
                    }
                  }}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Загрузите JSON файл с вопросами теста
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subjectId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Предмет</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isSubjectsLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите предмет" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {subjects.map((subject: any) => (
                    <SelectItem key={subject.id} value={subject.id.toString()}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Импорт..." : "Импортировать тест"}
        </Button>
      </form>
    </Form>
  );
}
