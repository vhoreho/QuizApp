import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useLogin } from "@/hooks/queries/useAuth";
import { ROUTES } from "@/lib/constants";
import { useUser } from "@/contexts/UserContext";
import { UserRole } from "@/lib/types";
import api from "@/api/axiosConfig";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoCircledIcon } from "@radix-ui/react-icons";

// Define the form schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Define the form values type
type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUser();
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const loginMutation = useLogin();

  // Redirect if already logged in
  if (user) {
    // Redirect based on user role
    if (user.role === UserRole.ADMIN) {
      navigate(ROUTES.DASHBOARD);
    } else if (user.role === UserRole.TEACHER) {
      navigate(ROUTES.DASHBOARD);
    } else {
      navigate(ROUTES.HOME);
    }
  }

  // Form setup
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Form submission handler
  const onSubmit = (data: LoginFormValues) => {
    try {
      loginMutation.mutate({
        username: data.username,
        password: data.password,
      });

      toast({
        title: "Успешный вход",
        description: "Вы успешно вошли в систему.",
      });

      // Redirect based on user role after successful login
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      if (userData.role === UserRole.ADMIN) {
        navigate(ROUTES.DASHBOARD);
      } else if (userData.role === UserRole.TEACHER) {
        navigate(ROUTES.DASHBOARD);
      } else {
        navigate(ROUTES.HOME);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Ошибка входа",
        description: "Неверное имя пользователя или пароль.",
      });
    }
  };

  // Debug function to test authentication
  const testAuth = async () => {
    try {
      const response = await api.get("/student/auth-test");
      setDebugInfo(JSON.stringify(response.data, null, 2));
      toast({
        title: "Auth Test",
        description: "Authentication test completed successfully",
      });
    } catch (error) {
      console.error("Auth test error:", error);
      setDebugInfo(JSON.stringify(error, null, 2));
      toast({
        variant: "destructive",
        title: "Auth Test Failed",
        description: "Authentication test failed",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
      <div className="w-full max-w-md p-4">
        <Card className="border-border/40 bg-background/95 backdrop-blur-sm shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Вход в систему
            </CardTitle>
            <CardDescription className="text-center">
              Введите ваши учетные данные для входа
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                          autoComplete="username"
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
                          autoComplete="current-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Вход..." : "Войти"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col">
            {loginMutation.isSuccess && (
              <div className="w-full mb-4">
                <Button
                  variant="outline"
                  className="w-full mb-2"
                  onClick={testAuth}
                >
                  Test Authentication
                </Button>
                {debugInfo && (
                  <Alert className="mt-2">
                    <InfoCircledIcon className="h-4 w-4" />
                    <AlertTitle>Debug Info</AlertTitle>
                    <AlertDescription>
                      <pre className="text-xs overflow-auto max-h-40 p-2 bg-muted rounded-md">
                        {debugInfo}
                      </pre>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
