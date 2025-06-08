import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "./header";
import { Footer } from "./footer";
import { User } from "@/lib/types";

interface PageLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
}

export function PageLayout({
  children,
  showHeader = true,
  showFooter = true,
}: PageLayoutProps) {
  const navigate = useNavigate();

  // Получаем пользователя из localStorage с правильной типизацией
  const userJson = localStorage.getItem("user");
  let currentUser: User | null = null;

  try {
    if (userJson) {
      const parsed = JSON.parse(userJson);
      // Проверяем, что полученный объект содержит необходимые поля
      if (
        parsed &&
        typeof parsed === "object" &&
        "id" in parsed &&
        "username" in parsed &&
        "role" in parsed
      ) {
        currentUser = parsed as User;
      } else {
        console.error("Invalid user data in localStorage");
      }
    }
  } catch (error) {
    console.error("Error parsing user data from localStorage:", error);
    localStorage.removeItem("user"); // Удаляем невалидные данные
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {showHeader && <Header user={currentUser} onLogout={handleLogout} />}

      <main className="flex-1 container mx-auto px-4 py-6">{children}</main>

      {showFooter && <Footer />}
    </div>
  );
}
