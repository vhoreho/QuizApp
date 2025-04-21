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
import {
  ArrowLeftIcon,
  PersonIcon,
  EnvelopeClosedIcon,
  LockClosedIcon,
  CheckCircledIcon,
  CalendarIcon,
  IdCardIcon,
  ReloadIcon,
  ExitIcon,
} from "@radix-ui/react-icons";

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
        name: currentUser?.username || "Имя пользователя",
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
        const updatedUser = { ...currentUser, username: data.name };
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

  const getRoleColorScheme = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return {
          gradient:
            "from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950",
          border: "border-indigo-100 dark:border-indigo-800/30",
          iconBg: "bg-indigo-100 dark:bg-indigo-900",
          iconColor: "text-indigo-500",
          buttonBg: "bg-indigo-600 hover:bg-indigo-700",
          footerBg:
            "from-indigo-50/50 to-indigo-100/50 dark:from-indigo-950/50 dark:to-indigo-900/50",
          footerBorder: "border-indigo-100 dark:border-indigo-800/30",
        };
      case UserRole.TEACHER:
        return {
          gradient: "from-blue-50 to-sky-50 dark:from-blue-950 dark:to-sky-950",
          border: "border-blue-100 dark:border-blue-800/30",
          iconBg: "bg-blue-100 dark:bg-blue-900",
          iconColor: "text-blue-500",
          buttonBg: "bg-blue-600 hover:bg-blue-700",
          footerBg:
            "from-blue-50/50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/50",
          footerBorder: "border-blue-100 dark:border-blue-800/30",
        };
      case UserRole.STUDENT:
      default:
        return {
          gradient:
            "from-green-50 to-teal-50 dark:from-green-950 dark:to-teal-950",
          border: "border-green-100 dark:border-green-800/30",
          iconBg: "bg-green-100 dark:bg-green-900",
          iconColor: "text-green-500",
          buttonBg: "bg-green-600 hover:bg-green-700",
          footerBg:
            "from-green-50/50 to-green-100/50 dark:from-green-950/50 dark:to-green-900/50",
          footerBorder: "border-green-100 dark:border-green-800/30",
        };
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

  const colorScheme = getRoleColorScheme(currentUser.role);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header user={currentUser} onLogout={handleLogout} />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center">
              <Button
                variant="ghost"
                className="flex items-center text-muted-foreground mr-4 hover:bg-muted/30 transition-colors group"
                onClick={() => navigate(getDashboardLink(currentUser.role))}
              >
                <ArrowLeftIcon className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Назад
              </Button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                  <div className={`${colorScheme.iconBg} p-1.5 rounded-full`}>
                    <PersonIcon
                      className={`h-6 w-6 ${colorScheme.iconColor}`}
                    />
                  </div>
                  Личный профиль
                </h1>
                <p className="text-muted-foreground">
                  Управление личными данными и настройками
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Info Card */}
            <Card
              withSticky
              className={`border ${colorScheme.border} bg-gradient-to-br ${colorScheme.gradient} shadow-md hover:shadow-lg transition-all duration-300 group overflow-hidden`}
            >
              <CardHeader>
                <div className="absolute top-2 right-2 opacity-5 group-hover:opacity-10 transition-opacity">
                  <PersonIcon
                    className={`h-32 w-32 ${colorScheme.iconColor} rotate-12`}
                  />
                </div>
                <CardTitle className="flex items-center">
                  <div
                    className={`${colorScheme.iconBg} p-2 rounded-full mr-2`}
                  >
                    <PersonIcon
                      className={`h-5 w-5 ${colorScheme.iconColor}`}
                    />
                  </div>
                  Информация
                </CardTitle>
                <CardDescription>Ваши основные данные</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-6">
                <div className="flex flex-col items-center space-y-4">
                  <div
                    className={`w-24 h-24 rounded-full ${colorScheme.iconBg} flex items-center justify-center text-2xl font-semibold ${colorScheme.iconColor}`}
                  >
                    {currentUser.username
                      ? currentUser.username.charAt(0)
                      : "U"}
                  </div>
                  <div className="text-center">
                    <h3 className="font-medium text-lg">
                      {currentUser.username || "Пользователь"}
                    </h3>
                    <div className="mt-1">{getRoleBadge(currentUser.role)}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-md bg-white/50 dark:bg-black/10">
                    <EnvelopeClosedIcon
                      className={`h-4 w-4 ${colorScheme.iconColor}`}
                    />
                    <div>
                      <p className="text-xs text-muted-foreground">Email:</p>
                      <p className="font-medium">{form.getValues().email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-md bg-white/50 dark:bg-black/10">
                    <IdCardIcon
                      className={`h-4 w-4 ${colorScheme.iconColor}`}
                    />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        ID пользователя:
                      </p>
                      <p className="font-medium">{currentUser.id}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-md bg-white/50 dark:bg-black/10">
                    <CalendarIcon
                      className={`h-4 w-4 ${colorScheme.iconColor}`}
                    />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Дата регистрации:
                      </p>
                      <p className="font-medium">
                        {new Date("2023-01-15T10:30:00Z").toLocaleDateString(
                          "ru-RU"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter
                className={`bg-gradient-to-r ${colorScheme.footerBg} border-t ${colorScheme.footerBorder}`}
              >
                <Button
                  variant="outline"
                  className={`w-full border-${colorScheme.iconColor}/20`}
                  onClick={handleLogout}
                >
                  <ExitIcon className="mr-2 h-4 w-4" />
                  Выйти из системы
                </Button>
              </CardFooter>
            </Card>

            {/* Edit Profile Card */}
            <Card
              withSticky
              className="border border-border col-span-1 lg:col-span-2 shadow-md hover:shadow-lg transition-all duration-300"
            >
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <div
                        className={`${colorScheme.iconBg} p-2 rounded-full mr-2`}
                      >
                        <PersonIcon
                          className={`h-5 w-5 ${colorScheme.iconColor}`}
                        />
                      </div>
                      Редактирование профиля
                    </CardTitle>
                    <CardDescription>
                      Обновите ваши личные данные и настройки
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 flex-1">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Имя</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Ваше имя"
                              className="border-muted-foreground/20"
                            />
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
                            <Input
                              {...field}
                              type="email"
                              placeholder="your.email@example.com"
                              className="border-muted-foreground/20"
                            />
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
                              {...field}
                              className="flex min-h-[120px] w-full rounded-md border border-muted-foreground/20 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              placeholder="Расскажите о себе"
                            />
                          </FormControl>
                          <FormDescription>
                            Краткая информация о вас, которая будет видна другим
                            пользователям.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div
                      className={`mt-6 p-4 rounded-lg bg-gradient-to-br ${colorScheme.gradient} ${colorScheme.border} border`}
                    >
                      <h3 className="font-medium mb-4 flex items-center gap-2">
                        <LockClosedIcon
                          className={`h-4 w-4 ${colorScheme.iconColor}`}
                        />
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
                                  className="bg-white/70 dark:bg-black/20 border-0"
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
                                  className="bg-white/70 dark:bg-black/20 border-0"
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
                                  className="bg-white/70 dark:bg-black/20 border-0"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter
                    className={`bg-gradient-to-r ${colorScheme.footerBg} border-t ${colorScheme.footerBorder}`}
                  >
                    <Button
                      type="submit"
                      className={`w-full group ${colorScheme.buttonBg}`}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircledIcon className="mr-2 h-4 w-4 group-hover:animate-pulse" />
                      )}
                      Сохранить изменения
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
