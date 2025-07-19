"use client"

import type { ReactNode } from "react"
import { AuthContext, useAuthLogic } from "@/hooks/use-auth"

export { useAuth } from "@/hooks/use-auth"

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuthLogic()

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}
