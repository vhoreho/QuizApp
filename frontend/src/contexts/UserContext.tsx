import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { User } from "@/lib/types";
import { authApi } from "@/api/auth";

// Define the shape of the context
interface UserContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  updateUser: (user: User) => void;
  logout: () => void;
  refetchUser: () => Promise<void>;
}

// Create the context with a default value
const UserContext = createContext<UserContextType | undefined>(undefined);

// Hook to use the context
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

// Define props for the provider component
interface UserProviderProps {
  children: ReactNode;
}

// Provider component
export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Function to fetch user data
  const fetchUser = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const userData = await authApi.getProfile();
      setUser(userData);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch user data")
      );
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Load user data on initial mount
  useEffect(() => {
    fetchUser();
  }, []);

  // Update user data
  const updateUser = (userData: User) => {
    setUser(userData);
  };

  // Logout function
  const logout = () => {
    setUser(null);
    // You might want to call your logout API here
    // and clear any stored tokens
  };

  // Value object that will be provided to consumers
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
