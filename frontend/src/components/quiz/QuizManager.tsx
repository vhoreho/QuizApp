import { useState, useEffect } from "react";
import { Quiz, UserRole, QuizSubject, Subject } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  PlusIcon,
  GridIcon,
  TableIcon,
  MixerHorizontalIcon,
  ResetIcon,
} from "@radix-ui/react-icons";
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
import { Input } from "@/components/ui/input";
import { QuizSubjects } from "./QuizSubjects";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { quizApi } from "@/api/quizApi";
import { getRadixSubjectIcon } from "@/lib/constants/radix-subject-icons";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<number | undefined>(
    undefined
  );
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>(quizzes);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch subjects
  const { data: subjects = [], isLoading: isSubjectsLoading } = useQuery({
    queryKey: ["subjects"],
    queryFn: quizApi.getAllSubjects,
  });

  // Get subject by ID
  const getSubjectById = (id: number): Subject | undefined => {
    return subjects.find((subject) => subject.id === id);
  };

  // Filter quizzes when search or subject changes
  useEffect(() => {
    let filtered = [...quizzes];

    // Apply search filter
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(
        (quiz) =>
          quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quiz.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply subject filter
    if (selectedSubject !== undefined) {
      filtered = filtered.filter((quiz) => quiz.subjectId === selectedSubject);
    }

    setFilteredQuizzes(filtered);
  }, [searchTerm, quizzes, selectedSubject]);

  // Handle subject selection
  const handleSubjectSelect = (subject: number | QuizSubject) => {
    if (selectedSubject === subject) {
      // If clicking the same subject, clear the filter
      setSelectedSubject(undefined);
    } else {
      setSelectedSubject(subject as number);
    }
  };

  // Reset all filters
  const clearFilters = () => {
    setSelectedSubject(undefined);
    setSearchTerm("");
  };

  // Сообщения в зависимости от роли пользователя
  const getEmptyMessage = () => {
    if (searchTerm || selectedSubject) {
      return "Тесты по заданным критериям не найдены";
    }

    return userRole === UserRole.ADMIN
      ? "В системе пока нет тестов"
      : "У вас пока нет созданных тестов";
  };

  // Check if filters are applied
  const hasFilters = searchTerm.trim() !== "" || selectedSubject !== undefined;

  return (
    <Card className="border border-border">
      <CardHeader className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative w-full max-w-sm">
            <Input
              type="text"
              placeholder="Поиск по названию"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <MixerHorizontalIcon className="h-4 w-4" />
                  Предметы
                  {selectedSubject && (
                    <span className="ml-1 w-2 h-2 rounded-full bg-primary"></span>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl overflow-y-auto max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle>Фильтр по предметам</DialogTitle>
                  <DialogDescription>
                    Выберите предмет для фильтрации тестов
                  </DialogDescription>
                </DialogHeader>

                <div className="py-6">
                  <QuizSubjects
                    selectedSubject={selectedSubject}
                    onSubjectSelect={handleSubjectSelect}
                    subjects={subjects}
                    isLoading={isSubjectsLoading}
                  />
                </div>

                <DialogFooter>
                  <Button
                    onClick={() => {
                      clearFilters();
                      setIsDialogOpen(false);
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Сбросить фильтры
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="flex items-center gap-1"
              >
                <ResetIcon className="h-3.5 w-3.5" />
                Сбросить
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === "grid" ? (
          <QuizGrid
            quizzes={filteredQuizzes}
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
            quizzes={filteredQuizzes}
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
