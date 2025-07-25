import { useNavigate } from "react-router-dom";
import { Quiz, UserRole } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusIcon, DotsVerticalIcon } from "@radix-ui/react-icons";
import { toast } from "@/components/ui/use-toast";
import { formatDate, renderUserInfo } from "@/lib/utils";

interface QuizManagementTableProps {
  userRole: UserRole;
  quizzes: Quiz[];
  isLoading: boolean;
  onCreateQuiz: () => void;
  onDeleteQuiz: (quizId: number) => Promise<void>;
  onUpdateQuizStatus: (quizId: number, isPublished: boolean) => Promise<any>;
}

export default function QuizManagementTable({
  userRole,
  quizzes,
  isLoading,
  onCreateQuiz,
  onDeleteQuiz,
  onUpdateQuizStatus,
}: QuizManagementTableProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-primary border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  const handleDeleteQuiz = async (quizId: number) => {
    if (window.confirm("Вы уверены, что хотите удалить этот тест?")) {
      try {
        await onDeleteQuiz(quizId);
        toast({
          title: "Успешно",
          description: "Тест был удален",
        });
      } catch (error) {
        console.error("Error deleting quiz:", error);
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Не удалось удалить тест",
        });
      }
    }
  };

  const handleUpdateQuizStatus = async (
    quizId: number,
    isPublished: boolean
  ) => {
    try {
      await onUpdateQuizStatus(quizId, isPublished);
      toast({
        title: "Успешно",
        description: isPublished ? "Тест опубликован" : "Тест скрыт",
      });
    } catch (error) {
      console.error("Error updating quiz status:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось обновить статус теста",
      });
    }
  };

  // Определяем маршрут для страницы результатов в зависимости от роли
  const getResultsPath = (quizId: number) => {
    return userRole === UserRole.ADMIN
      ? `/admin/quizzes/${quizId}/results`
      : `/teacher/quizzes/${quizId}/results`;
  };

  return (
    <div>
      {quizzes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            {userRole === UserRole.ADMIN
              ? "В системе пока нет тестов"
              : "У вас пока нет созданных тестов"}
          </p>
          <Button onClick={onCreateQuiz}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Создать первый тест
          </Button>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Описание</TableHead>
                {userRole === UserRole.ADMIN && <TableHead>Автор</TableHead>}
                <TableHead>Дата создания</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quizzes.map((quiz) => (
                <TableRow key={quiz.id}>
                  <TableCell className="font-medium">{quiz.title}</TableCell>
                  <TableCell className="max-w-[300px]">
                    <div className="line-clamp-3 overflow-hidden text-ellipsis">
                      {quiz.description}
                    </div>
                  </TableCell>
                  {userRole === UserRole.ADMIN && (
                    <TableCell>{renderUserInfo(quiz.createdBy)}</TableCell>
                  )}
                  <TableCell>{formatDate(quiz.createdAt)}</TableCell>
                  <TableCell>
                    <Badge variant={quiz.isPublished ? "success" : "secondary"}>
                      {quiz.isPublished ? "Опубликован" : "Черновик"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex ml-auto rounded-full items-center gap-1"
                        >
                          <DotsVerticalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => navigate(`/quiz/${quiz.id}`)}
                        >
                          Просмотр
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => navigate(`/edit-quiz/${quiz.id}`)}
                        >
                          Редактировать
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => navigate(getResultsPath(quiz.id))}
                        >
                          Результаты
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleUpdateQuizStatus(quiz.id, !quiz.isPublished)
                          }
                        >
                          {quiz.isPublished ? "Скрыть" : "Опубликовать"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteQuiz(quiz.id)}
                        >
                          Удалить
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
