import { QuestionType } from "@/lib/types";

// Форматирование даты
export const formatDate = (dateString?: string): string => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Получение метки для типа вопроса
export const getQuestionTypeLabel = (type: QuestionType): string => {
  switch (type) {
    case "SINGLE_CHOICE":
      return "Один вариант";
    case "MULTIPLE_CHOICE":
      return "Несколько вариантов";
    case "TRUE_FALSE":
      return "Да/Нет";
    case "MATCHING":
      return "Сопоставление";
    default:
      return "Неизвестный тип";
  }
}; 