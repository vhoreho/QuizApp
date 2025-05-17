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
import { useQueryClient } from "@tanstack/react-query";
import { Subject } from "@/lib/types";
import { SUBJECT_ICONS } from "@/lib/constants/subject-icons";
import { getRadixSubjectIcon } from "@/lib/constants/radix-subject-icons.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { quizApi } from "@/api/quizApi";

// Схема валидации для формы предмета
const subjectFormSchema = z.object({
  name: z.string().min(1, "Название предмета обязательно"),
  icon: z.string().min(1, "Иконка обязательна"),
});

type SubjectFormValues = z.infer<typeof subjectFormSchema>;

export function SubjectManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const queryClient = useQueryClient();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("📚");

  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectFormSchema),
    defaultValues: {
      name: "",
      icon: "📚",
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
          icon: data.icon,
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
          icon: data.icon,
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

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

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
          <DialogContent>
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
                      <FormLabel>Название</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Введите название предмета"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Иконка предмета</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue>
                              <span className="text-2xl">{field.value}</span>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(SUBJECT_ICONS).map(
                              ([key, icon]) => (
                                <SelectItem key={key + icon} value={icon}>
                                  <div className="flex items-center gap-2">
                                    <span className="text-2xl">{icon}</span>
                                    <span>{key}</span>
                                  </div>
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
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
          <div>Загрузка...</div>
        ) : (
          <>
            {subjects.length === 0 && (
              <div className="text-center py-4">
                <p className="text-muted-foreground">
                  Нет предметов. Создайте первый.
                </p>
              </div>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Иконка</TableHead>
                  <TableHead>Название</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.map((subject) => (
                  <TableRow key={subject.id}>
                    <TableCell>
                      <span className="flex items-center justify-center">
                        {editingSubject?.id === subject.id
                          ? getRadixSubjectIcon(subject.name)
                          : getRadixSubjectIcon(subject.name)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {editingSubject?.id === subject.id ? (
                        <Form {...form}>
                          <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="flex gap-2"
                          >
                            <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="icon"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Select
                                      value={field.value}
                                      onValueChange={field.onChange}
                                    >
                                      <SelectTrigger className="w-[100px]">
                                        <SelectValue>
                                          <span className="text-2xl">
                                            {field.value}
                                          </span>
                                        </SelectValue>
                                      </SelectTrigger>
                                      <SelectContent>
                                        {Object.entries(SUBJECT_ICONS).map(
                                          ([key, icon]) => (
                                            <SelectItem
                                              key={key + icon}
                                              value={icon}
                                            >
                                              <div className="flex items-center gap-2">
                                                <span className="text-2xl">
                                                  {icon}
                                                </span>
                                                <span>{key}</span>
                                              </div>
                                            </SelectItem>
                                          )
                                        )}
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditingSubject(null)}
                              >
                                Отмена
                              </Button>
                              <Button type="submit">Сохранить</Button>
                            </div>
                          </form>
                        </Form>
                      ) : (
                        subject.name
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingSubject?.id !== subject.id && (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingSubject(subject);
                              form.reset({
                                name: subject.name,
                                icon: subject.icon,
                              });
                            }}
                          >
                            <Pencil1Icon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteSubject(subject.id)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </CardContent>
    </Card>
  );
}
