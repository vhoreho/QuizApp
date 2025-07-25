import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, UserRole } from "../lib/types";
import { Header } from "../components/layout/header";
import { Footer } from "../components/layout/footer";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "../components/ui/use-toast";
import { useUser } from "../contexts/UserContext";
import {
  PersonIcon,
  LockClosedIcon,
  CheckCircledIcon,
  ReloadIcon,
  ExitIcon,
} from "@radix-ui/react-icons";

const profileFormSchema = z
  .object({
    name: z.string().min(2, {
      message: "Имя должно содержать не менее 2 символов",
    }),
    currentPassword: z.string().optional(),
    newPassword: z
      .string()
      .min(8, {
        message: "Пароль должен содержать не менее 8 символов",
      })
      .optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => !data.newPassword || data.newPassword === data.confirmPassword,
    {
      message: "Пароли не совпадают",
      path: ["confirmPassword"],
    }
  )
  .refine((data) => !data.newPassword || data.currentPassword, {
    message: "Для смены пароля необходимо ввести текущий пароль",
    path: ["currentPassword"],
  });

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading: isUserLoading, logout, updateUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!user && !isUserLoading) {
      navigate("/login");
      return;
    }

    if (user) {
      form.reset({
        name: user.username || "",
      });
    }
  }, [user, isUserLoading, navigate, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true);
    try {
      // В реальном приложении здесь будет запрос к API
      setTimeout(() => {
        toast({
          title: "Профиль обновлен",
          description: "Ваш профиль успешно обновлен",
        });
        setIsLoading(false);
      }, 1000);

      // Обновляем пользовательские данные, если имя было изменено
      if (data.name && user && data.name !== user.username) {
        const updatedUser = { ...user, username: data.name };
        updateUser(updatedUser);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить профиль",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Функция для отображения бейджа роли
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return (
          <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300">
            Администратор
          </Badge>
        );
      case UserRole.TEACHER:
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            Преподаватель
          </Badge>
        );
      case UserRole.STUDENT:
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            Студент
          </Badge>
        );
      default:
        return <Badge variant="outline">Неизвестно</Badge>;
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header user={user} onLogout={handleLogout} />

      <main className="flex-1">
        <div className="container max-w-4xl py-8">
          <h1 className="text-2xl font-bold mb-6">Профиль пользователя</h1>

          <div className="grid gap-6">
            {/* Карточка профиля */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-semibold text-primary">
                    {user.username
                      ? user.username.charAt(0).toUpperCase()
                      : "U"}
                  </div>
                  <div>
                    <CardTitle>{user.username}</CardTitle>
                    <div className="mt-1">{getRoleBadge(user.role)}</div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Имя пользователя</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Введите имя пользователя"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="p-4 border rounded-md bg-slate-50 dark:bg-slate-900">
                      <h3 className="font-medium mb-4 flex items-center gap-2">
                        <LockClosedIcon className="h-4 w-4" />
                        Сменить пароль
                      </h3>

                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="currentPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Текущий пароль</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="password"
                                  placeholder="••••••••"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Новый пароль</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="password"
                                  placeholder="••••••••"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Подтвердите пароль</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="password"
                                  placeholder="••••••••"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1"
                      >
                        {isLoading ? (
                          <>
                            <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                            Сохранение...
                          </>
                        ) : (
                          <>
                            <CheckCircledIcon className="mr-2 h-4 w-4" />
                            Сохранить изменения
                          </>
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        onClick={handleLogout}
                        className="flex gap-2"
                      >
                        <ExitIcon className="h-4 w-4" />
                        Выйти
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
