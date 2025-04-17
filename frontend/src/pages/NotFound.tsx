import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User } from "../lib/types";
import { Header } from "../components/layout/header";
import { Button } from "../components/ui/button";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

export default function NotFound() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // Load user from localStorage
    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        setCurrentUser(user);
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header user={currentUser} onLogout={handleLogout} />

      <main className="flex-1 flex items-center justify-center">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="flex flex-col items-center max-w-md mx-auto">
            <div className="rounded-full bg-muted p-6 mb-6">
              <ExclamationTriangleIcon className="h-12 w-12 text-muted-foreground" />
            </div>

            <h1 className="text-4xl font-bold mb-4">404</h1>
            <h2 className="text-2xl font-semibold mb-2">Страница не найдена</h2>
            <p className="text-muted-foreground mb-8">
              Извините, страница, которую вы ищете, не существует или была
              перемещена.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={() => navigate(-1)}>Вернуться назад</Button>
              <Button variant="outline" asChild>
                <Link to="/">На главную</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Quiz App. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
