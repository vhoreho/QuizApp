import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, UserRole } from "../../lib/types";
import { Header } from "../../components/layout/header";
import { Button } from "../../components/ui/button";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Badge } from "../../components/ui/badge";
import { authApi } from "../../api/auth";
import { adminApi } from "../../api/quizApi";
import { toast } from "../../components/ui/use-toast";

export default function UserManagement() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const user = await authApi.getProfile();
        if (user.role !== UserRole.ADMIN) {
          navigate("/not-authorized");
          return;
        }

        setCurrentUser(user);
        await fetchUsers();
      } catch (error) {
        console.error("Error fetching user:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }
    };

    fetchUserAndData();
  }, [navigate]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const fetchedUsers = await adminApi.getAllUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить список пользователей",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUserRole = async (userId: number, role: UserRole) => {
    try {
      await adminApi.updateUserRole(userId, role);
      toast({
        title: "Успешно",
        description: "Роль пользователя обновлена",
      });
      fetchUsers();
    } catch (error) {
      console.error("Error updating user role:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось обновить роль пользователя",
      });
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm("Вы уверены, что хотите удалить этого пользователя?")) {
      try {
        await adminApi.deleteUser(userId);
        toast({
          title: "Успешно",
          description: "Пользователь удален",
        });
        fetchUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Не удалось удалить пользователя",
        });
      }
    }
  };

  const handleLogout = async () => {
    await authApi.logout();
    setCurrentUser(null);
    navigate("/login");
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return <Badge variant="default">Администратор</Badge>;
      case UserRole.TEACHER:
        return <Badge variant="secondary">Преподаватель</Badge>;
      case UserRole.STUDENT:
        return <Badge variant="outline">Студент</Badge>;
      default:
        return <Badge variant="outline">Неизвестно</Badge>;
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
        Активен
      </Badge>
    ) : (
      <Badge
        variant="secondary"
        className="bg-gray-100 text-gray-800 hover:bg-gray-100"
      >
        Неактивен
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-primary border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка пользователей...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header user={currentUser!} onLogout={handleLogout} />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Button
                variant="ghost"
                className="flex items-center text-muted-foreground mr-4"
                onClick={() => navigate("/admin/dashboard")}
              >
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Назад
              </Button>
              <div>
                <h1 className="text-3xl font-bold">
                  Управление пользователями
                </h1>
                <p className="text-muted-foreground">
                  Просмотр и управление пользователями системы
                </p>
              </div>
            </div>
            <Button onClick={() => navigate("/admin/users/create")}>
              Добавить пользователя
            </Button>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Имя</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Роль</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Дата регистрации</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      Пользователей не найдено
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        {getStatusBadge(user.isActive || false)}
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Открыть меню</span>
                              <DotsHorizontalIcon className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                navigate(`/admin/users/${user.id}`)
                              }
                            >
                              Просмотр профиля
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateUserRole(user.id, UserRole.ADMIN)
                              }
                              disabled={user.role === UserRole.ADMIN}
                            >
                              Сделать администратором
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateUserRole(user.id, UserRole.TEACHER)
                              }
                              disabled={user.role === UserRole.TEACHER}
                            >
                              Сделать преподавателем
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateUserRole(user.id, UserRole.STUDENT)
                              }
                              disabled={user.role === UserRole.STUDENT}
                            >
                              Сделать студентом
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.isActive ? (
                              <DropdownMenuItem>
                                Деактивировать
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem>Активировать</DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              Удалить
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
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
