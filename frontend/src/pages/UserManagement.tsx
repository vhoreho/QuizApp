import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, UserRole } from "../lib/types";
import { authApi } from "../api/auth";
import api from "../api/axiosConfig";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  ArrowLeftIcon,
  UpdateIcon,
  PersonIcon,
  IdCardIcon,
  EnvelopeClosedIcon,
  LockClosedIcon,
  PlusIcon,
  CheckCircledIcon,
  MagnifyingGlassIcon,
  GearIcon,
  Cross2Icon,
} from "@radix-ui/react-icons";
import { Header } from "../components/layout/header";
import { Footer } from "../components/layout/footer";
import { Badge } from "@/components/ui/badge";

const createUserSchema = z.object({
  firstName: z.string().min(1, "Имя обязательно"),
  lastName: z.string().min(1, "Фамилия обязательна"),
  email: z.string().email("Неверный формат email"),
  username: z
    .string()
    .min(3, "Имя пользователя должно содержать минимум 3 символа"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
  role: z.enum([UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT]),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

export default function UserManagement() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userCountByRole, setUserCountByRole] = useState({
    admin: 0,
    teacher: 0,
    student: 0,
  });

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      password: "",
      role: UserRole.STUDENT,
    },
  });

  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (!userJson) {
      navigate("/login");
      return;
    }

    const user = JSON.parse(userJson) as User;
    if (user.role !== UserRole.ADMIN) {
      navigate("/login");
      return;
    }

    setCurrentUser(user);
    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users");
      setUsers(response.data);

      // Расчет пользователей по ролям
      const counts = {
        admin: 0,
        teacher: 0,
        student: 0,
      };

      response.data.forEach((user: User) => {
        if (user.role === UserRole.ADMIN) counts.admin++;
        else if (user.role === UserRole.TEACHER) counts.teacher++;
        else if (user.role === UserRole.STUDENT) counts.student++;
      });

      setUserCountByRole(counts);
    } catch (err: any) {
      console.error("Error fetching users:", err);
    }
  };

  const onSubmit = async (data: CreateUserFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      // Конвертируем данные формы в формат для API
      const registrationData = {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        username: data.username,
        password: data.password,
        role: data.role,
      };
      await authApi.registerUser(registrationData);
      form.reset();
      fetchUsers();
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Не удалось создать пользователя"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-primary border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header user={currentUser} onLogout={handleLogout} />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              className="flex items-center text-muted-foreground mr-4 hover:bg-muted/30 transition-colors group"
              onClick={() => navigate("/admin/dashboard")}
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Назад
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <div className="bg-indigo-100 dark:bg-indigo-900 p-1.5 rounded-full">
                  <PersonIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                Управление пользователями
              </h1>
              <p className="text-muted-foreground">
                Создание и управление учетными записями пользователей
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="border border-border bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 shadow-md hover:shadow-lg transition-all duration-300 group overflow-hidden">
              <CardHeader className="py-4 pb-0 relative">
                <div className="absolute top-0 right-0 -mt-6 -mr-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <PersonIcon className="h-24 w-24 text-indigo-500 rotate-12" />
                </div>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <div className="bg-indigo-100 dark:bg-indigo-900 p-1 rounded-full">
                    <PersonIcon className="h-3.5 w-3.5 text-indigo-500" />
                  </div>
                  Всего пользователей
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3 pb-4">
                <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                  {users.length}
                </div>
                <div className="flex gap-2 mt-2">
                  <Badge
                    variant="outline"
                    className="bg-purple-50 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                  >
                    {userCountByRole.admin} администраторов
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 shadow-md hover:shadow-lg transition-all duration-300 group overflow-hidden">
              <CardHeader className="py-4 pb-0 relative">
                <div className="absolute top-0 right-0 -mt-6 -mr-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <GearIcon className="h-24 w-24 text-green-500 rotate-12" />
                </div>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <div className="bg-green-100 dark:bg-green-900 p-1 rounded-full">
                    <GearIcon className="h-3.5 w-3.5 text-green-500" />
                  </div>
                  Преподаватели
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3 pb-4">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors">
                  {userCountByRole.teacher}
                </div>
                <div className="text-xs text-muted-foreground mt-1 flex items-center">
                  <CheckCircledIcon className="h-3 w-3 mr-1 text-green-500" />
                  <span>Создатели тестов и заданий</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950 dark:to-sky-950 shadow-md hover:shadow-lg transition-all duration-300 group overflow-hidden">
              <CardHeader className="py-4 pb-0 relative">
                <div className="absolute top-0 right-0 -mt-6 -mr-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <PersonIcon className="h-24 w-24 text-blue-500 rotate-12" />
                </div>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <div className="bg-blue-100 dark:bg-blue-900 p-1 rounded-full">
                    <PersonIcon className="h-3.5 w-3.5 text-blue-500" />
                  </div>
                  Студенты
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3 pb-4">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                  {userCountByRole.student}
                </div>
                <div className="text-xs text-muted-foreground mt-1 flex items-center">
                  <MagnifyingGlassIcon className="h-3 w-3 mr-1 text-blue-500" />
                  <span>Проходят тестирование</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Create User Form */}
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
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1.5">
                            <PersonIcon className="h-3.5 w-3.5 text-indigo-500" />
                            Имя
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Введите имя"
                              {...field}
                              disabled={isLoading}
                              className="border-indigo-100 dark:border-indigo-800/30 focus-visible:ring-indigo-500/30"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1.5">
                            <PersonIcon className="h-3.5 w-3.5 text-indigo-500" />
                            Фамилия
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Введите фамилию"
                              {...field}
                              disabled={isLoading}
                              className="border-indigo-100 dark:border-indigo-800/30 focus-visible:ring-indigo-500/30"
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
                          <FormLabel className="flex items-center gap-1.5">
                            <EnvelopeClosedIcon className="h-3.5 w-3.5 text-indigo-500" />
                            Email
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="email@example.com"
                              {...field}
                              disabled={isLoading}
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
                            Имя пользователя
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Введите имя пользователя"
                              {...field}
                              disabled={isLoading}
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
                              disabled={isLoading}
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
                            disabled={isLoading}
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
                      disabled={isLoading}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700"
                    >
                      {isLoading ? (
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

            {/* User List */}
            <Card className="border border-border bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950 dark:to-sky-950 shadow-md hover:shadow-lg transition-all duration-300 group overflow-hidden">
              <CardHeader>
                <div className="absolute top-2 right-2 opacity-5 group-hover:opacity-10 transition-opacity">
                  <PersonIcon className="h-32 w-32 text-blue-500 rotate-12" />
                </div>
                <CardTitle className="flex items-center group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  <div className="bg-blue-100 p-2 rounded-full mr-2 dark:bg-blue-900">
                    <PersonIcon className="h-5 w-5 text-blue-500" />
                  </div>
                  Пользователи
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <MagnifyingGlassIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  Список всех пользователей в системе
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-blue-100 dark:border-blue-800/30">
                  <Table>
                    <TableHeader className="bg-blue-50/50 dark:bg-blue-950/50">
                      <TableRow className="hover:bg-blue-100/50 dark:hover:bg-blue-900/20">
                        <TableHead className="text-blue-700 dark:text-blue-300">
                          Имя
                        </TableHead>
                        <TableHead className="text-blue-700 dark:text-blue-300">
                          Имя пользователя
                        </TableHead>
                        <TableHead className="text-blue-700 dark:text-blue-300">
                          Email
                        </TableHead>
                        <TableHead className="text-blue-700 dark:text-blue-300">
                          Роль
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow
                          key={user.id}
                          className="hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
                        >
                          <TableCell className="font-medium">
                            {user.firstName && user.lastName
                              ? `${user.firstName} ${user.lastName}`
                              : user.firstName ||
                                user.lastName ||
                                user.username}
                          </TableCell>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                user.role === UserRole.ADMIN
                                  ? "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"
                                  : user.role === UserRole.TEACHER
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
                                  : "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                              }`}
                            >
                              {user.role === UserRole.ADMIN && (
                                <div className="bg-purple-200 dark:bg-purple-800 p-1 rounded-full mr-1.5">
                                  <PersonIcon className="h-2 w-2 text-purple-700 dark:text-purple-300" />
                                </div>
                              )}
                              {user.role === UserRole.TEACHER && (
                                <div className="bg-green-200 dark:bg-green-800 p-1 rounded-full mr-1.5">
                                  <GearIcon className="h-2 w-2 text-green-700 dark:text-green-300" />
                                </div>
                              )}
                              {user.role === UserRole.STUDENT && (
                                <div className="bg-blue-200 dark:bg-blue-800 p-1 rounded-full mr-1.5">
                                  <PersonIcon className="h-2 w-2 text-blue-700 dark:text-blue-300" />
                                </div>
                              )}
                              {user.role === UserRole.ADMIN
                                ? "Администратор"
                                : user.role === UserRole.TEACHER
                                ? "Преподаватель"
                                : "Студент"}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                      {users.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="h-32 text-center">
                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                              <PersonIcon className="h-10 w-10 mb-2 text-muted-foreground/30" />
                              Пользователи не найдены
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="bg-gradient-to-r from-blue-50/50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/50 border-t border-blue-100 dark:border-blue-800/30">
                <Button
                  variant="outline"
                  className="w-full border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                >
                  <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                  Поиск пользователей
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
