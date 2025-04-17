import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authApi } from "../api/auth";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserRole } from "../lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ReaderIcon, EnterIcon } from "@radix-ui/react-icons";
import { ThemeToggle } from "../components/theme-toggle";

const loginSchema = z.object({
  username: z.string().min(1, "Имя пользователя обязательно"),
  password: z.string().min(1, "Пароль обязателен"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const from = location.state?.from?.pathname || "/";

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  useEffect(() => {
    // Initialize the auth interceptor is now handled in App.tsx
    // authApi.setupAuthInterceptor();

    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        // If user explicitly navigated to login page, don't auto-redirect
        if (location.pathname === "/login" && !location.state?.from) {
          return;
        }

        const token = localStorage.getItem("token");
        if (!token) return;

        // Try to get profile to verify token is valid
        const user = await authApi.getProfile();

        // Redirect based on role
        if (user.role === UserRole.ADMIN) {
          navigate("/admin/dashboard");
        } else if (user.role === UserRole.TEACHER) {
          navigate("/teacher/dashboard");
        } else if (user.role === UserRole.STUDENT) {
          navigate("/student/dashboard");
        } else {
          navigate(from);
        }
      } catch (error) {
        // If the token is invalid or expired, it will be caught here
        console.error("Authentication check failed:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    };

    checkAuth();
  }, [navigate, from, location]);

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.login(data);

      // Redirect based on role
      if (response.user.role === UserRole.ADMIN) {
        navigate("/admin/dashboard");
      } else if (response.user.role === UserRole.TEACHER) {
        navigate("/teacher/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Ошибка входа в систему");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <div className="flex justify-end p-4">
        <ThemeToggle />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center mb-8">
            <ReaderIcon className="h-10 w-10 text-primary mr-2" />
            <h1 className="text-3xl font-bold">Quiz App</h1>
          </div>

          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                Вход в систему
              </CardTitle>
              <CardDescription className="text-center">
                Введите свои учетные данные для входа
              </CardDescription>
            </CardHeader>

            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Имя пользователя</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Введите имя пользователя"
                            {...field}
                            disabled={isLoading}
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
                        <FormLabel>Пароль</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Введите пароль"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      "Вход..."
                    ) : (
                      <>
                        <EnterIcon className="mr-2 h-4 w-4" />
                        Войти
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>

            <CardFooter className="flex justify-center border-t border-border pt-4">
              <p className="text-sm text-muted-foreground">
                Образовательная платформа для тестирования знаний
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>

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
