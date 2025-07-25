import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PlusIcon, Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import { toast } from "@/components/ui/use-toast";
import { Subject } from "@/lib/types";
import { getAutoSubjectIcon } from "@/lib/constants/radix-subject-icons";

import { quizApi } from "@/api/quizApi";

// Схема валидации для формы предмета
const subjectFormSchema = z.object({
  name: z.string().min(1, "Название предмета обязательно"),
});

type SubjectFormValues = z.infer<typeof subjectFormSchema>;

export function SubjectManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectFormSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const data = await quizApi.getAllSubjects();
      setSubjects(data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      toast({ title: "Ошибка при загрузке предметов", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSubject = async (id: number) => {
    if (!confirm("Вы уверены, что хотите удалить этот предмет?")) {
      return;
    }

    try {
      await quizApi.deleteSubject(id);
      setSubjects(subjects.filter((subject) => subject.id !== id));
      toast({ title: "Предмет успешно удален" });
    } catch (error) {
      console.error("Error deleting subject:", error);
      toast({ title: "Ошибка при удалении предмета", variant: "destructive" });
    }
  };

  const onSubmit = async (data: SubjectFormValues) => {
    try {
      if (editingSubject) {
        const updatedSubject = await quizApi.updateSubject(editingSubject.id, {
          name: data.name,
        });
        setSubjects(
          subjects.map((subject) =>
            subject.id === editingSubject.id ? updatedSubject : subject
          )
        );
        setEditingSubject(null);
        toast({ title: "Предмет успешно обновлен" });
      } else {
        const newSubject = await quizApi.createSubject({
          name: data.name,
        });
        setSubjects([...subjects, newSubject]);
        setIsCreateDialogOpen(false);
        toast({ title: "Предмет успешно создан" });
      }
      form.reset();
    } catch (error) {
      console.error("Error saving subject:", error);
      toast({
        title: `Ошибка при ${
          editingSubject ? "обновлении" : "создании"
        } предмета`,
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Управление предметами</CardTitle>
          <CardDescription>
            Создавайте и управляйте предметами тестов
          </CardDescription>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              Создать предмет
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingSubject ? "Редактировать предмет" : "Создать предмет"}
              </DialogTitle>
              <DialogDescription>
                {editingSubject
                  ? "Измените информацию о предмете"
                  : "Заполните информацию о новом предмете"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Название предмета</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Введите название предмета"
                          {...field}
                          className="text-lg h-12"
                        />
                      </FormControl>
                      <FormMessage />
                      {field.value && (
                        <div className="flex items-center gap-2 mt-2 p-2 bg-muted/50 rounded-md">
                          <div className="flex items-center justify-center w-8 h-8 bg-background rounded border">
                            {getAutoSubjectIcon(field.value)}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            Автоматически выбранная иконка
                          </span>
                        </div>
                      )}
                    </FormItem>
                  )}
                />

                <DialogFooter className="gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      setEditingSubject(null);
                      form.reset();
                    }}
                  >
                    Отмена
                  </Button>
                  <Button type="submit">
                    {editingSubject ? "Сохранить" : "Создать"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-t-2 border-primary border-solid rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Загрузка предметов...</p>
          </div>
        ) : (
          <>
            {subjects.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 text-6xl text-muted-foreground/50">
                  📚
                </div>
                <h3 className="text-lg font-semibold mb-2">Нет предметов</h3>
                <p className="text-muted-foreground mb-4">
                  Создайте первый предмет для организации тестов
                </p>
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  variant="outline"
                >
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Создать предмет
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjects.map((subject) => (
                  <Card
                    key={subject.id}
                    className="hover:shadow-md transition-shadow duration-200 border-2 hover:border-primary/20"
                  >
                    <CardContent className="p-6">
                      {editingSubject?.id === subject.id ? (
                        <Form {...form}>
                          <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-4"
                          >
                            <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Название</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="Название предмета"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="flex gap-2 pt-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingSubject(null);
                                  form.reset();
                                }}
                                className="flex-1"
                              >
                                Отмена
                              </Button>
                              <Button
                                type="submit"
                                size="sm"
                                className="flex-1"
                              >
                                Сохранить
                              </Button>
                            </div>
                          </form>
                        </Form>
                      ) : (
                        <>
                          <div className="text-center mb-4">
                            <div className="mb-2 flex justify-center">
                              <div className="w-12 h-12 flex items-center justify-center bg-muted rounded-lg">
                                {getAutoSubjectIcon(subject.name)}
                              </div>
                            </div>
                            <h3 className="font-semibold text-lg">
                              {subject.name}
                            </h3>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingSubject(subject);
                                form.reset({
                                  name: subject.name,
                                });
                              }}
                              className="flex-1"
                            >
                              <Pencil1Icon className="mr-2 h-3 w-3" />
                              Изменить
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteSubject(subject.id)}
                              className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                            >
                              <TrashIcon className="h-3 w-3" />
                            </Button>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
