"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useAuth, type User, type AuthState } from "@/hooks/use-auth"

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; user: User }>
  signup: (userData: {
    email: string
    password: string
    firstName?: string
    lastName?: string
    username?: string
  }) => Promise<{ success: boolean; user: User }>
  logout: () => void
  updateUser: (updates: Partial<User>) => Promise<User | undefined>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider")
  }
  return context
}
