import { useState, useEffect } from "react";
import { User, QuizSubject, Subject } from "@/lib/types";
import { QuizCard } from "@/components/quiz/QuizCard";
import { UserRole } from "@/lib/types";
import { MESSAGES } from "@/lib/constants";
import { QuizSubjects } from "@/components/quiz/QuizSubjects";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MagnifyingGlassIcon, ResetIcon } from "@radix-ui/react-icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { quizApi } from "@/api/quizApi";

interface StudentHomeViewProps {
  quizzes: any[];
  currentUser: User | null;
  hasUserTakenQuiz: (quizId: number) => boolean;
}

export const StudentHomeView = ({
  quizzes,
  currentUser,
  hasUserTakenQuiz,
}: StudentHomeViewProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<number | undefined>(
    undefined
  );
  const [filteredQuizzes, setFilteredQuizzes] = useState<any[]>(quizzes);
  const [viewMode, setViewMode] = useState<"all" | "subjects">("all");

  // Fetch subjects
  const { data: subjects = [], isLoading: isSubjectsLoading } = useQuery<
    Subject[]
  >({
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

  // Group quizzes by subject for subjects view
  const quizzesBySubject: Record<string, { name: string; quizzes: any[] }> =
    filteredQuizzes.reduce((acc, quiz) => {
      const subjectId = String(quiz.subjectId);
      const subject = getSubjectById(quiz.subjectId);
      const subjectName = subject?.name || "Неизвестный предмет";

      if (!acc[subjectId]) {
        acc[subjectId] = {
          name: subjectName,
          quizzes: [],
        };
      }

      acc[subjectId].quizzes.push(quiz);
      return acc;
    }, {} as Record<string, { name: string; quizzes: any[] }>);

  if (quizzes.length === 0) {
    return (
      <div className="bg-muted rounded-lg p-8 text-center">
        <h3 className="text-lg font-medium mb-2">
          {MESSAGES.QUIZZES.EMPTY_QUIZZES}
        </h3>
        <p className="text-muted-foreground mb-4">
          {MESSAGES.QUIZZES.NO_AVAILABLE_QUIZZES}
        </p>
      </div>
    );
  }

  const hasQuizzes = filteredQuizzes.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full max-w-sm">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Поиск по названию"
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {(selectedSubject || searchTerm) && (
          <Button
            variant="outline"
            onClick={clearFilters}
            className="flex items-center gap-2"
          >
            <ResetIcon className="h-4 w-4" />
            Сбросить фильтры
          </Button>
        )}
      </div>

      <Tabs
        defaultValue="all"
        onValueChange={(value) => setViewMode(value as "all" | "subjects")}
        className="w-full"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="all">Все тесты</TabsTrigger>
          <TabsTrigger value="subjects">По предметам</TabsTrigger>
        </TabsList>

        <TabsContent value="subjects">
          <div className="mb-8">
            <h2 className="text-lg font-medium mb-4">Выберите предмет</h2>
            <QuizSubjects
              selectedSubject={selectedSubject}
              onSubjectSelect={handleSubjectSelect}
              subjects={subjects}
              isLoading={isSubjectsLoading}
            />
          </div>

          {hasQuizzes ? (
            <div className="space-y-10">
              {Object.entries(quizzesBySubject).map(([subjectId, subject]) => (
                <div key={subjectId} className="border-t pt-4">
                  <h3 className="text-xl font-bold mb-4 flex items-center">
                    <span className="mr-2">{subject.name}</span>
                    <Badge variant="outline">{subject.quizzes.length}</Badge>
                  </h3>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {subject.quizzes.map((quiz) => (
                      <QuizCard
                        key={quiz.id}
                        quiz={quiz}
                        variant="student"
                        userRole={UserRole.STUDENT}
                        showBadges={false}
                        className="h-full"
                        hasTaken={hasUserTakenQuiz(quiz.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-muted rounded-lg p-8 text-center">
              <h3 className="text-lg font-medium mb-2">Тесты не найдены</h3>
              <p className="text-muted-foreground mb-4">
                {selectedSubject
                  ? "Нет доступных тестов по выбранному предмету. Попробуйте выбрать другой предмет."
                  : "На данный момент нет доступных тестов для прохождения."}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="all">
          {hasQuizzes ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredQuizzes.map((quiz) => (
                <QuizCard
                  key={quiz.id}
                  quiz={quiz}
                  variant="student"
                  userRole={UserRole.STUDENT}
                  showBadges={false}
                  className="h-full"
                  hasTaken={hasUserTakenQuiz(quiz.id)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-muted rounded-lg p-8 text-center">
              <h3 className="text-lg font-medium mb-2">Тесты не найдены</h3>
              <p className="text-muted-foreground mb-4">
                По заданным критериям не найдено ни одного теста.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
