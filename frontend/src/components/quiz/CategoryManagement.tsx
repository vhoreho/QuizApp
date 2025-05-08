import { useState } from "react";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/axiosConfig";

// Схема валидации для формы категории
const categoryFormSchema = z.object({
  name: z.string().min(1, "Название категории обязательно"),
  description: z.string().min(1, "Описание категории обязательно"),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

interface Category {
  id: number;
  name: string;
  description: string;
}

export function CategoryManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const queryClient = useQueryClient();

  // Получаем список категорий
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await api.get("/categories");
      return response.data;
    },
  });

  // Мутация для создания категории
  const createCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormValues) => {
      const response = await api.post("/categories", {
        ...data,
        icon: "BookIcon",
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Категория создана",
        description: "Новая категория успешно создана",
      });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось создать категорию",
        variant: "destructive",
      });
    },
  });

  // Мутация для обновления категории
  const updateCategoryMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: CategoryFormValues;
    }) => {
      const response = await api.put(`/categories/${id}`, {
        ...data,
        icon: "BookIcon",
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setEditingCategory(null);
      toast({
        title: "Категория обновлена",
        description: "Категория успешно обновлена",
      });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить категорию",
        variant: "destructive",
      });
    },
  });

  // Мутация для удаления категории
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({
        title: "Категория удалена",
        description: "Категория успешно удалена",
      });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить категорию",
        variant: "destructive",
      });
    },
  });

  // Форма для создания/редактирования категории
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Обработчик отправки формы
  const onSubmit = (data: CategoryFormValues) => {
    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, data });
    } else {
      createCategoryMutation.mutate(data);
    }
  };

  // Обработчик открытия диалога редактирования
  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    form.reset({
      name: category.name,
      description: category.description,
    });
  };

  // Обработчик удаления категории
  const handleDelete = (id: number) => {
    if (window.confirm("Вы уверены, что хотите удалить эту категорию?")) {
      deleteCategoryMutation.mutate(id);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Управление категориями</CardTitle>
          <CardDescription>
            Создавайте и управляйте категориями тестов
          </CardDescription>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              Создать категорию
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory
                  ? "Редактировать категорию"
                  : "Создать категорию"}
              </DialogTitle>
              <DialogDescription>
                {editingCategory
                  ? "Измените информацию о категории"
                  : "Заполните информацию о новой категории"}
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
                          placeholder="Введите название категории"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Описание</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Введите описание категории"
                          {...field}
                        />
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
                      setEditingCategory(null);
                      form.reset();
                    }}
                  >
                    Отмена
                  </Button>
                  <Button type="submit">
                    {editingCategory ? "Сохранить" : "Создать"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {categories.map((category: Category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <h3 className="font-medium">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(category)}
                  >
                    <Pencil1Icon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(category.id)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
