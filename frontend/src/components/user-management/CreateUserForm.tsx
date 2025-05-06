import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { authApi, RegisterUserData } from "@/api/auth";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserRole } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UpdateIcon,
  PersonIcon,
  IdCardIcon,
  LockClosedIcon,
  PlusIcon,
  GearIcon,
  Cross2Icon,
} from "@radix-ui/react-icons";

// Схема для создания пользователя
const createUserSchema = z.object({
  name: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  username: z
    .string()
    .min(3, "Имя пользователя должно содержать минимум 3 символа"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
  role: z.enum([UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT]),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;

export const CreateUserForm = () => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      username: "",
      password: "",
      role: UserRole.STUDENT,
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: CreateUserFormValues) => {
      // Явно указываем типы для соответствия с RegisterUserData
      const registerData: RegisterUserData = {
        name: data.name,
        username: data.username,
        password: data.password,
        role: data.role,
      };
      await authApi.registerUser(registerData);
    },
    onSuccess: () => {
      // Очистка формы и обновление списка пользователей
      form.reset();
      setError(null);
      // Инвалидируем запрос на получение пользователей, чтобы обновить список
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err: any) => {
      setError(
        err.response?.data?.message || "Не удалось создать пользователя"
      );
    },
  });

  const onSubmit = (data: CreateUserFormValues) => {
    createUserMutation.mutate(data);
  };

  return (
    <Card className="border border-border bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 shadow-md hover:shadow-lg transition-all duration-300 group overflow-hidden">
      <CardHeader>
        <div className="absolute top-2 right-2 opacity-5 group-hover:opacity-10 transition-opacity">
          <PlusIcon className="h-32 w-32 text-indigo-500 rotate-12" />
        </div>
        <CardTitle className="flex items-center group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          <div className="bg-indigo-100 p-2 rounded-full mr-2 dark:bg-indigo-900">
            <PlusIcon className="h-5 w-5 text-indigo-500" />
          </div>
          Создание нового пользователя
        </CardTitle>
        <CardDescription>
          Создайте нового пользователя с определенной ролью в системе
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert
            variant="destructive"
            className="mb-4 border border-red-200 bg-red-50 dark:bg-red-950/40 dark:border-red-800/50 group overflow-hidden relative"
          >
            <Cross2Icon className="h-4 w-4 text-red-600 dark:text-red-400 absolute right-4 opacity-50" />
            <AlertDescription className="flex items-center">
              <div className="bg-red-100 p-1 rounded-full mr-2 dark:bg-red-900/50">
                <Cross2Icon className="h-3 w-3 text-red-500" />
              </div>
              {error}
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <PersonIcon className="h-3.5 w-3.5 text-indigo-500" />
                    Имя
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Введите полное имя пользователя"
                      {...field}
                      disabled={createUserMutation.isPending}
                      className="border-indigo-100 dark:border-indigo-800/30 focus-visible:ring-indigo-500/30"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <IdCardIcon className="h-3.5 w-3.5 text-indigo-500" />
                    Логин
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Введите логин пользователя"
                      {...field}
                      disabled={createUserMutation.isPending}
                      className="border-indigo-100 dark:border-indigo-800/30 focus-visible:ring-indigo-500/30"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <LockClosedIcon className="h-3.5 w-3.5 text-indigo-500" />
                    Пароль
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Введите пароль"
                      {...field}
                      disabled={createUserMutation.isPending}
                      className="border-indigo-100 dark:border-indigo-800/30 focus-visible:ring-indigo-500/30"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <GearIcon className="h-3.5 w-3.5 text-indigo-500" />
                    Роль
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={createUserMutation.isPending}
                  >
                    <FormControl>
                      <SelectTrigger className="border-indigo-100 dark:border-indigo-800/30 focus-visible:ring-indigo-500/30">
                        <SelectValue placeholder="Выберите роль" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={UserRole.STUDENT}>
                        <span className="flex items-center gap-2">
                          <div className="bg-blue-100 dark:bg-blue-900 p-1 rounded-full">
                            <PersonIcon className="h-3 w-3 text-blue-500" />
                          </div>
                          Студент
                        </span>
                      </SelectItem>
                      <SelectItem value={UserRole.TEACHER}>
                        <span className="flex items-center gap-2">
                          <div className="bg-green-100 dark:bg-green-900 p-1 rounded-full">
                            <GearIcon className="h-3 w-3 text-green-500" />
                          </div>
                          Преподаватель
                        </span>
                      </SelectItem>
                      <SelectItem value={UserRole.ADMIN}>
                        <span className="flex items-center gap-2">
                          <div className="bg-purple-100 dark:bg-purple-900 p-1 rounded-full">
                            <PersonIcon className="h-3 w-3 text-purple-500" />
                          </div>
                          Администратор
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={createUserMutation.isPending}
              className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700"
            >
              {createUserMutation.isPending ? (
                <>
                  <UpdateIcon className="mr-2 h-4 w-4 animate-spin" />
                  Создание...
                </>
              ) : (
                <>
                  <PlusIcon className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                  Создать пользователя
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
