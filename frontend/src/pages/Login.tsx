import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { ReaderIcon, EnterIcon } from "@radix-ui/react-icons";
import { ThemeToggle } from "../components/theme-toggle";
import { PAGE_TITLES, ROUTES, MESSAGES } from "@/lib/constants";
import { toast } from "@/components/ui/use-toast";
import { useLogin } from "@/hooks/queries/useAuth";

// Определение схемы и типа для формы входа
const loginSchema = z.object({
  username: z.string().min(1, "Имя пользователя обязательно"),
  password: z.string().min(1, "Пароль обязателен"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const from = location.state?.from?.pathname || ROUTES.HOME;

  // Используем хук для авторизации
  const loginMutation = useLogin();
  const isLoading = loginMutation.isPending;

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setError(null);
      await loginMutation.mutateAsync({
        username: data.username,
        password: data.password,
      });
      toast({
        title: "Успех",
        description: MESSAGES.SUCCESS.LOGIN_SUCCESS,
      });
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Login error:", error);
      setError(MESSAGES.ERRORS.LOGIN_FAILED);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <div className="flex justify-end p-4">
        <ThemeToggle />
      </div>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center mb-8">
            <ReaderIcon className="h-10 w-10 text-primary mr-2" />
            <h1 className="text-3xl font-bold">Quiz App</h1>
          </div>

          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                {PAGE_TITLES.LOGIN}
              </CardTitle>
              <CardDescription className="text-center">
                Введите свои учетные данные для входа
              </CardDescription>
            </CardHeader>

            <CardContent>
              {error && (
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4">
                  {error}
                </div>
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
                      MESSAGES.COMMON.LOADING
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
