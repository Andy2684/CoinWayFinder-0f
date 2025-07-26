"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  username?: string
  role: "user" | "admin"
  subscriptionStatus: "free" | "starter" | "pro" | "enterprise"
  isEmailVerified: boolean
  lastLogin?: string
  createdAt: string
  updatedAt: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; error?: string }>
  logout: () => Promise<void>
  signup: (userData: {
    email: string
    password: string
    firstName: string
    lastName: string
    username?: string
    acceptTerms: boolean
  }) => Promise<{ success: boolean; message?: string; error?: string }>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Check authentication status on mount and refresh
  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.user) {
          setUser(data.user)
        } else {
          setUser(null)
        }
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      console.log("Attempting login for:", email)

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), password }),
      })

      const data = await response.json()
      console.log("Login response:", data)

      if (data.success && data.user) {
        setUser(data.user)
        return { success: true, message: data.message }
      } else {
        console.error("Login failed:", data)
        return { success: false, error: data.error, message: data.message }
      }
    } catch (error) {
      console.error("Login network error:", error)
      return { success: false, error: "Network error occurred" }
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setUser(null)
    }
  }

  const signup = async (userData: {
    email: string
    password: string
    firstName: string
    lastName: string
    username?: string
    acceptTerms: boolean
  }) => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (data.success) {
        // Don't auto-login after signup as requested
        return { success: true, message: data.message }
      } else {
        return { success: false, error: data.error, message: data.message }
      }
    } catch (error) {
      console.error("Signup error:", error)
      return { success: false, error: "Network error occurred" }
    }
  }

  const refreshUser = async () => {
    await checkAuth()
  }

  const value = {
    user,
    loading,
    login,
    logout,
    signup,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
