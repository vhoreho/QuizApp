import React, { createContext, useState, useContext, useEffect } from "react";
import { User } from "@/lib/types";
import { authApi } from "@/api/auth";

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
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { isAuthenticated, user } = await authApi.checkAuth();

      if (isAuthenticated && user) {
        setUser(user);
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        setUser(null);
        localStorage.removeItem("user");
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to fetch user data")
      );
      setUser(null);
      localStorage.removeItem("user");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      await authApi.logout();
      setUser(null);
    } catch (error) {
      console.error("Error during logout:", error);
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
