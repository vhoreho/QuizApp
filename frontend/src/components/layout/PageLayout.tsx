import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "./header";
import { Footer } from "./footer";

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

  // Получаем пользователя из localStorage
  const userJson = localStorage.getItem("user");
  const currentUser = userJson ? JSON.parse(userJson) : null;

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
