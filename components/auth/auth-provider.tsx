"use client"

import type React from "react"
import { AuthContext, useAuthProvider, useAuth } from "@/hooks/use-auth"

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const authValue = useAuthProvider()

  return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
}

// Re-export useAuth for convenience
export { useAuth }
