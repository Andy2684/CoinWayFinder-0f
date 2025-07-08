"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

interface AuthUser {
  id: string
  email: string
  name: string
  subscription?: {
    plan: "free" | "basic" | "premium" | "enterprise"
    status: "active" | "cancelled" | "expired"
    endDate: string
  } | null
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  signUp: (
    email: string,
    password: string,
    name: string,
    confirmPassword: string,
  ) => Promise<{ success: boolean; message: string }>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/auth/me")
      const data = await response.json()

      if (data.success) {
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error("Failed to fetch user:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success) {
        await fetchUser()
      }

      return data
    } catch (error) {
      return { success: false, message: "Network error. Please try again." }
    }
  }

  const signUp = async (email: string, password: string, name: string, confirmPassword: string) => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, confirmPassword }),
      })

      const data = await response.json()

      if (data.success) {
        await fetchUser()
      }

      return data
    } catch (error) {
      return { success: false, message: "Network error. Please try again." }
    }
  }

  const signOut = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" })
      setUser(null)
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  const refreshUser = async () => {
    await fetchUser()
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
