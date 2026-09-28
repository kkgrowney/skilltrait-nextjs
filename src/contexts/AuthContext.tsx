'use client';

import { logger } from "@/lib/logger";

import { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<boolean>;
  isLoggingOut: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => false,
  isLoggingOut: false,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async (): Promise<boolean> => {
    logger.debug("AuthContext logout called");
    try {
      setIsLoggingOut(true);
      logger.debug("Signing out from Firebase...");
      await signOut(auth);
      logger.debug("Firebase signOut successful");
      // Clear any local state if needed
      setUser(null);
      logger.debug("User state cleared");
      return true;
    } catch (error) {
      logger.error("Logout error:", error);
      return false;
    } finally {
      setIsLoggingOut(false);
      logger.debug("Logout process finished");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, isLoggingOut }}>
      {children}
    </AuthContext.Provider>
  );
}
