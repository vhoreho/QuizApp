import { useState } from "react";
import { Quiz, UserRole } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { PlusIcon, GridIcon, TableIcon } from "@radix-ui/react-icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { QuizGrid } from "./QuizGrid";
import QuizManagementTable from "./QuizManagementTable";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface QuizManagerProps {
  title: string;
  description: string;
  userRole: UserRole;
  quizzes: Quiz[];
  isLoading: boolean;
  onCreateQuiz: () => void;
  onDeleteQuiz: (quizId: number) => Promise<void>;
  onUpdateQuizStatus: (quizId: number, isPublished: boolean) => Promise<any>;
  defaultView?: "grid" | "table";
}

export function QuizManager({
  title,
  description,
  userRole,
  quizzes,
  isLoading,
  onCreateQuiz,
  onDeleteQuiz,
  onUpdateQuizStatus,
  defaultView = "grid",
}: QuizManagerProps) {
  const [viewMode, setViewMode] = useState<"grid" | "table">(defaultView);

  // Сообщения в зависимости от роли пользователя
  const getEmptyMessage = () => {
    return userRole === UserRole.ADMIN
      ? "В системе пока нет тестов"
      : "У вас пока нет созданных тестов";
  };

  return (
    <Card className="border border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <div className="flex items-center gap-4">
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(value: string) => {
              if (value === "grid" || value === "table") {
                setViewMode(value);
              }
            }}
          >
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <GridIcon className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="table" aria-label="Table view">
              <TableIcon className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>

          <Button className="flex items-center" onClick={onCreateQuiz}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Создать тест
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === "grid" ? (
          <QuizGrid
            quizzes={quizzes}
            userRole={userRole}
            isLoading={isLoading}
            onCreateQuiz={onCreateQuiz}
            onDeleteQuiz={onDeleteQuiz}
            onUpdateQuizStatus={onUpdateQuizStatus}
            emptyMessage={getEmptyMessage()}
          />
        ) : (
          <QuizManagementTable
            userRole={userRole}
            quizzes={quizzes}
            isLoading={isLoading}
            onCreateQuiz={onCreateQuiz}
            onDeleteQuiz={onDeleteQuiz}
            onUpdateQuizStatus={onUpdateQuizStatus}
          />
        )}
      </CardContent>
    </Card>
  );
}
