import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, UserRole } from "../lib/types";
import { Header } from "../components/layout/header";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "../components/ui/use-toast";
import api from "../api/axiosConfig";

const profileFormSchema = z
  .object({
    name: z.string().min(2, {
      message: "Имя должно содержать не менее 2 символов",
    }),
    email: z.string().email({
      message: "Пожалуйста, введите корректный email адрес",
    }),
    bio: z
      .string()
      .max(500, {
        message: "Информация о себе не должна превышать 500 символов",
      })
      .optional(),
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
      bio: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (!userJson) {
      navigate("/login");
      return;
    }

    const user = JSON.parse(userJson) as User;
    setCurrentUser(user);
    fetchUserProfile(user.id);
  }, [navigate]);

  const fetchUserProfile = async (userId: number) => {
    setIsLoading(true);
    try {
      // In a real application, this would fetch from your API
      // const response = await api.get(`/users/${userId}`);
      // const userData = response.data;

      // Mock data for demonstration
      const userData = {
        id: userId,
        name: currentUser?.name || "Имя пользователя",
        email: "user@example.com",
        bio: "Краткая информация о пользователе. Это демонстрационный текст, который может быть заменен на реальную информацию из профиля пользователя.",
        role: currentUser?.role || UserRole.STUDENT,
        createdAt: "2023-01-15T10:30:00Z",
      };

      form.reset({
        name: userData.name,
        email: userData.email,
        bio: userData.bio,
      });
    } catch (err) {
      console.error("Error fetching user profile:", err);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные профиля",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true);
    try {
      // In a real application, this would update the user profile
      // await api.put(`/users/${currentUser?.id}`, data);

      // Mock success
      setTimeout(() => {
        toast({
          title: "Профиль обновлен",
          description: "Ваш профиль успешно обновлен",
        });
        setIsLoading(false);
      }, 1000);

      // Update localStorage user data if name was changed
      if (data.name && currentUser) {
        const updatedUser = { ...currentUser, name: data.name };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
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
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    navigate("/login");
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return <Badge>Администратор</Badge>;
      case UserRole.TEACHER:
        return <Badge variant="secondary">Преподаватель</Badge>;
      case UserRole.STUDENT:
        return <Badge variant="outline">Студент</Badge>;
      default:
        return <Badge variant="outline">Неизвестно</Badge>;
    }
  };

  const getDashboardLink = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return "/admin/dashboard";
      case UserRole.TEACHER:
        return "/teacher/dashboard";
      case UserRole.STUDENT:
        return "/student/dashboard";
      default:
        return "/";
    }
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header user={currentUser} onLogout={handleLogout} />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              className="flex items-center text-muted-foreground mr-4"
              onClick={() => navigate(getDashboardLink(currentUser.role))}
            >
              Назад
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Профиль</h1>
              <p className="text-muted-foreground">
                Управление личными данными
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Info Card */}
            <Card className="border border-border lg:col-span-1">
              <CardHeader>
                <CardTitle>Информация</CardTitle>
                <CardDescription>Ваша основная информация</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-2xl font-semibold">
                    {currentUser.name?.charAt(0) || "U"}
                  </div>
                  <div className="text-center">
                    <h3 className="font-medium text-lg">{currentUser.name}</h3>
                    <div className="mt-1">{getRoleBadge(currentUser.role)}</div>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Email:
                    </span>
                    <p className="font-medium">{form.getValues().email}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Роль:</span>
                    <p className="font-medium">
                      {currentUser.role === UserRole.ADMIN
                        ? "Администратор"
                        : currentUser.role === UserRole.TEACHER
                        ? "Преподаватель"
                        : "Студент"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Edit Profile Form */}
            <Card className="border border-border lg:col-span-2">
              <CardHeader>
                <CardTitle>Редактировать профиль</CardTitle>
                <CardDescription>
                  Обновите свою личную информацию
                </CardDescription>
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
                          <FormLabel>Имя</FormLabel>
                          <FormControl>
                            <Input placeholder="Ваше имя" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="name@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>О себе</FormLabel>
                          <FormControl>
                            <textarea
                              className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              placeholder="Краткая информация о себе"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Не более 500 символов
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4">
                      <h3 className="font-medium">Изменить пароль</h3>

                      <FormField
                        control={form.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Текущий пароль</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
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
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormDescription>
                              Не менее 8 символов
                            </FormDescription>
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
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Сохранение..." : "Сохранить изменения"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="border-t border-border bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Quiz App. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
