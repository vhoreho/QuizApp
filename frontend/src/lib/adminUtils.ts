import { UserRole } from "./types";

export type BadgeType = {
  className: string;
  label: string;
};

/**
 * Возвращает данные для бейджа для отображения роли пользователя
 */
export const getRoleBadgeProps = (role: UserRole): BadgeType => {
  switch (role) {
    case UserRole.ADMIN:
      return {
        className: "bg-green-100 text-green-800 hover:bg-green-200",
        label: "Администратор"
      };
    case UserRole.TEACHER:
      return {
        className: "bg-blue-100 text-blue-800 hover:bg-blue-200",
        label: "Преподаватель"
      };
    case UserRole.STUDENT:
      return {
        className: "bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
        label: "Студент"
      };
    default:
      return {
        className: "border-border bg-transparent",
        label: "Неизвестно"
      };
  }
};

/**
 * Возвращает данные для бейджа для отображения статуса публикации теста
 */
export const getQuizStatusBadgeProps = (isPublished: boolean): BadgeType => {
  return isPublished
    ? {
      className: "bg-green-100 text-green-800",
      label: "Опубликован"
    }
    : {
      className: "bg-amber-100 text-amber-800",
      label: "Черновик"
    };
};

/**
 * Возвращает данные для бейджа для отображения типа уведомления
 */
export const getNotificationTypeBadgeProps = (type: string): BadgeType => {
  if (type === "user") {
    return {
      className: "bg-indigo-50 text-indigo-700",
      label: "Пользователь"
    };
  } else if (type === "quiz") {
    return {
      className: "bg-green-50 text-green-700",
      label: "Тест"
    };
  } else if (type === "result") {
    return {
      className: "bg-blue-50 text-blue-700",
      label: "Результат"
    };
  } else {
    return {
      className: "bg-orange-50 text-orange-700",
      label: "Система"
    };
  }
};

/**
 * Возвращает текст статуса публикации для кнопки
 */
export const getQuizStatusActionText = (isPublished: boolean): string => {
  return isPublished ? "Черновик" : "Опубликовать";
};

/**
 * Цвета для графиков и визуализаций
 */
export const CHART_COLORS = [
  "#4f46e5", // Indigo
  "#0ea5e9", // Sky
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Violet
  "#ec4899", // Pink
];

/**
 * Форматирует имя пользователя
 */
export const formatUserFullName = (firstName?: string, lastName?: string): string => {
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  } else if (firstName) {
    return firstName;
  } else if (lastName) {
    return lastName;
  } else {
    return "-";
  }
}; 