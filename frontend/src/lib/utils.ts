import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { User } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Checks if the provided value is a valid User object
 * @param user Any value to check
 * @returns Boolean indicating if the value is a valid User object
 */
export const isValidUser = (user: any): user is User => {
  return (
    user &&
    typeof user === "object" &&
    "id" in user &&
    "username" in user &&
    "role" in user
  )
}

/**
 * Renders user information as a string based on a potential user object or ID
 * @param userOrId User object, user ID, or any value
 * @returns String representation of the user
 */
export const renderUserInfo = (userOrId: any): string => {
  // If it's a valid user object, return username
  if (isValidUser(userOrId)) {
    return userOrId.username || "Неизвестно"
  }
  // Otherwise it might be an ID or other value
  return userOrId ? String(userOrId) : "Неизвестно"
}

/**
 * Format a date string to localized format
 * @param dateString ISO date string
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}
