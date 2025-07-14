// components/auth/auth-provider.tsx

"use client";

import { ReactNode, createContext, useContext, useState } from "react";

interface User {
  id: string;
  email: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (email: string, password: string) => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function login(email: string, password: string) {
    try {
      setError(null);
      // TODO: заменить на ваш реальный API-вызов
      setUser({ id: "user-id", email });
    } catch (e: any) {
      setError(e.message || "Login failed");
      throw e;
    }
  }

  async function signup(email: string, password: string) {
    try {
      setError(null);
      // TODO: заменить на ваш реальный API-вызов регистрации
      // Например:
      // await fetch("/api/auth/signup", { method: "POST", body: JSON.stringify({ email, password }) });
      setUser({ id: "new-user-id", email });
    } catch (e: any) {
      setError(e.message || "Signup failed");
      throw e;
    }
  }

  function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, signup, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
