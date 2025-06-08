import { useState } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { QuizSubject, Subject } from "@/lib/types";
import { getAutoSubjectIcon } from "@/lib/constants/radix-subject-icons";

interface QuizSubjectsProps {
  selectedSubject?: QuizSubject | number;
  onSubjectSelect: (subject: QuizSubject | number) => void;
  subjects?: Subject[];
  isLoading?: boolean;
}

export function QuizSubjects({
  selectedSubject,
  onSubjectSelect,
  subjects = [],
  isLoading = false,
}: QuizSubjectsProps) {
  console.log("QuizSubjects props:", { subjects, isLoading, selectedSubject });

  if (isLoading) {
    return <div className="text-center py-4">Загрузка предметов...</div>;
  }

  if (!subjects || subjects.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        Нет доступных предметов
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {subjects.map((subject) => (
        <Card
          key={subject.id}
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedSubject === subject.id && "border-primary"
          }`}
          onClick={() => onSubjectSelect(subject.id)}
        >
          <CardContent className="p-4 text-center flex flex-col items-center justify-center gap-2">
            <span className="flex items-center justify-center p-2 rounded-full bg-muted">
              {getAutoSubjectIcon(subject.name)}
            </span>
            <CardTitle className="text-lg">{subject.name}</CardTitle>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
