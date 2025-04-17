import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, UserRole } from "../../lib/types";
import { Header } from "../../components/layout/header";
import { Button } from "../../components/ui/button";
import {
  ArrowLeftIcon,
  PlusIcon,
  DotsHorizontalIcon,
} from "@radix-ui/react-icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { useToast } from "../../components/ui/use-toast";
import api from "../../api/axiosConfig";
import { authApi } from "../../api/auth";

interface Student {
  id: number;
  name: string;
  email: string;
  quizzesTaken: number;
  averageScore: number;
}

interface Group {
  id: number;
  name: string;
  description: string;
  studentsCount: number;
  assignedQuizzes: number;
  students: Student[];
}

export default function TeacherGroups() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const user = await authApi.getProfile();
        if (user.role !== UserRole.TEACHER) {
          navigate("/not-authorized");
          return;
        }

        setCurrentUser(user);
        fetchGroups();
      } catch (error) {
        console.error("Error fetching user:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const fetchGroups = async () => {
    setIsLoading(true);
    try {
      // In a real application, this would fetch from your API
      // const response = await api.get("/teacher/groups");
      // setGroups(response.data);

      // Mock data for demonstration
      setGroups([
        {
          id: 1,
          name: "Группа JavaScript",
          description: "Группа для изучения JavaScript",
          studentsCount: 12,
          assignedQuizzes: 5,
          students: [
            {
              id: 1,
              name: "Иванов Алексей",
              email: "ivanov@example.com",
              quizzesTaken: 4,
              averageScore: 85,
            },
            {
              id: 2,
              name: "Смирнова Ольга",
              email: "smirnova@example.com",
              quizzesTaken: 5,
              averageScore: 92,
            },
            {
              id: 3,
              name: "Петров Дмитрий",
              email: "petrov@example.com",
              quizzesTaken: 3,
              averageScore: 78,
            },
          ],
        },
        {
          id: 2,
          name: "Группа Веб-разработки",
          description: "Изучение HTML, CSS и веб-технологий",
          studentsCount: 8,
          assignedQuizzes: 3,
          students: [
            {
              id: 4,
              name: "Козлова Анна",
              email: "kozlova@example.com",
              quizzesTaken: 3,
              averageScore: 88,
            },
            {
              id: 5,
              name: "Соколов Игорь",
              email: "sokolov@example.com",
              quizzesTaken: 2,
              averageScore: 75,
            },
          ],
        },
        {
          id: 3,
          name: "Алгоритмы",
          description: "Изучение алгоритмов и структур данных",
          studentsCount: 6,
          assignedQuizzes: 2,
          students: [
            {
              id: 6,
              name: "Новикова Елена",
              email: "novikova@example.com",
              quizzesTaken: 2,
              averageScore: 90,
            },
          ],
        },
      ]);
    } catch (err) {
      console.error("Error fetching groups:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await authApi.logout();
    setCurrentUser(null);
    navigate("/login");
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-secondary";
    return "text-destructive";
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) {
      toast({
        title: "Ошибка",
        description: "Название группы не может быть пустым",
        variant: "destructive",
      });
      return;
    }

    // In a real application, you would make an API call to create the group
    // await api.post("/teacher/groups", { name: newGroupName, description: newGroupDescription });

    // Simulate creating a new group
    const newGroup: Group = {
      id: groups.length + 1,
      name: newGroupName,
      description: newGroupDescription,
      studentsCount: 0,
      assignedQuizzes: 0,
      students: [],
    };

    setGroups([...groups, newGroup]);
    setNewGroupName("");
    setNewGroupDescription("");
    setIsCreateDialogOpen(false);

    toast({
      title: "Группа создана",
      description: `Группа "${newGroupName}" успешно создана`,
    });
  };

  const handleDeleteGroup = (groupId: number) => {
    // In a real application, you would make an API call to delete the group
    // await api.delete(`/teacher/groups/${groupId}`);

    // Simulate deleting a group
    setGroups(groups.filter((group) => group.id !== groupId));

    toast({
      title: "Группа удалена",
      description: "Группа успешно удалена",
    });
  };

  const handleSelectGroup = (group: Group) => {
    setSelectedGroup(group);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-primary border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header user={currentUser!} onLogout={handleLogout} />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              className="flex items-center text-muted-foreground mr-4"
              onClick={() => navigate("/teacher/dashboard")}
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Назад
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Группы студентов</h1>
              <p className="text-muted-foreground">
                Управление группами студентов
              </p>
            </div>
          </div>

          <Card className="border border-border">
            <CardHeader>
              <CardTitle>Функционал в разработке</CardTitle>
              <CardDescription>
                Управление группами студентов скоро будет доступно
              </CardDescription>
            </CardHeader>
            <CardContent className="py-10">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 mb-4 text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-full h-full"
                  >
                    <path d="M11 18h2"></path>
                    <path d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"></path>
                    <path d="M12 12v-2"></path>
                    <path d="M12 2v2"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-2">
                  Функционал находится в разработке
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Мы работаем над тем, чтобы вы могли создавать и управлять
                  группами студентов. Эта функция будет доступна в ближайшее
                  время.
                </p>
                <Button onClick={() => navigate("/teacher/dashboard")}>
                  Вернуться на дашборд
                </Button>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/50 flex justify-center border-t px-6 py-4">
              <p className="text-xs text-muted-foreground">
                Ожидаемое время запуска функционала: скоро
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
