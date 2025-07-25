import React, { createContext, useState, useContext, useEffect } from "react";
import { User } from "@/lib/types";
import { authApi } from "@/api/auth";
import { hasAuthCookie, getUserFromLocalStorage } from "@/utils/authCheck";
import { useNavigate, useLocation } from "react-router-dom";

const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password"] as const;

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  updateUser: (user: User) => void;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

interface UserProviderProps {
  children: React.ReactNode;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export const UserProvider = ({ children }: UserProviderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(() =>
    getUserFromLocalStorage()
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if auth cookie exists before making the request
      const hasAuth = await hasAuthCookie();

      if (!hasAuth) {
        setUser(null);
        localStorage.removeItem("user");
        setIsLoading(false);

        // Only redirect to login if we're not already there and not on a public route
        if (!PUBLIC_ROUTES.includes(location.pathname as any)) {
          navigate("/login", { replace: true });
        }
        return;
      }

      const { isAuthenticated, user } = await authApi.checkAuth();

      if (isAuthenticated && user) {
        setUser(user);
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        setUser(null);
        localStorage.removeItem("user");
        if (!PUBLIC_ROUTES.includes(location.pathname as any)) {
          navigate("/login", { replace: true });
        }
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to fetch user data")
      );
      setUser(null);
      localStorage.removeItem("user");
      if (!PUBLIC_ROUTES.includes(location.pathname as any)) {
        navigate("/login", { replace: true });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [location.pathname]);

  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      await authApi.logout();
      setUser(null);
      localStorage.removeItem("user");
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Error during logout:", error);
      // Even if the logout API call fails, we should still clear local state
      setUser(null);
      localStorage.removeItem("user");
      navigate("/login", { replace: true });
    }
  };

  const value = {
    user,
    isLoading,
    error,
    updateUser,
    logout,
    refetchUser: fetchUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
