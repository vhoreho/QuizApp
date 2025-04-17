import { Link } from "react-router-dom";
import { User, UserRole } from "../../lib/types";
import { ThemeToggle } from "../theme-toggle";
import { Button } from "../ui/button";
import { ExitIcon, PersonIcon, HomeIcon } from "@radix-ui/react-icons";

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

export function Header({ user, onLogout }: HeaderProps) {
  // Helper function to get the dashboard URL based on user role
  const getDashboardUrl = () => {
    if (!user) return "/";

    switch (user.role) {
      case UserRole.ADMIN:
        return "/admin/dashboard";
      case UserRole.TEACHER:
        return "/teacher/dashboard";
      case UserRole.STUDENT:
        return "/student/dashboard";
      default:
        return "/";
    }
  };

  return (
    <header className="bg-background border-b border-border sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-foreground font-bold text-xl">
            Quiz App
          </Link>

          {user && (
            <nav className="hidden md:flex space-x-4">
              <Link to={getDashboardUrl()}>
                <Button variant="ghost" size="sm" className="flex items-center">
                  <HomeIcon className="mr-2 h-4 w-4" />
                  Панель управления
                </Button>
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <ThemeToggle />

          {user ? (
            <div className="flex items-center space-x-2">
              <Link to="/profile">
                <Button variant="ghost" size="sm" className="flex items-center">
                  <PersonIcon className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">{user.name}</span>
                </Button>
              </Link>

              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                className="flex items-center"
              >
                <ExitIcon className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Выйти</span>
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button size="sm">Войти</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
