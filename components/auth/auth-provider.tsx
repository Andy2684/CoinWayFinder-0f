"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  name?: string
  isEmailVerified?: boolean
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
  signup: (userData: {
    email: string
    password: string
    firstName: string
    lastName: string
  }) => Promise<{ success: boolean; message?: string }>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        setLoading(false)
        return
      }

      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
      } else {
        localStorage.removeItem("auth_token")
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      localStorage.removeItem("auth_token")
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        try {
          const errorData = await response.json()
          return {
            success: false,
            message: errorData.message || errorData.error || "Login failed",
          }
        } catch (jsonError) {
          return {
            success: false,
            message: `Login failed with status ${response.status}`,
          }
        }
      }

      const data = await response.json()

      if (data.success && data.token) {
        localStorage.setItem("auth_token", data.token)
        setUser(data.user)
        return { success: true, message: data.message }
      } else {
        return {
          success: false,
          message: data.message || "Login failed",
        }
      }
    } catch (error) {
      console.error("Login error:", error)
      return {
        success: false,
        message: "Network error occurred. Please check your connection and try again.",
      }
    }
  }

  const signup = async (userData: {
    email: string
    password: string
    firstName: string
    lastName: string
  }) => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        try {
          const errorData = await response.json()
          return {
            success: false,
            message: errorData.message || errorData.error || "Signup failed",
          }
        } catch (jsonError) {
          return {
            success: false,
            message: `Signup failed with status ${response.status}`,
          }
        }
      }

      const data = await response.json()

      if (data.success) {
        // Don't automatically log in or redirect to dashboard
        // Just return success - user stays on current page
        return {
          success: true,
          message: data.message || "Account created successfully",
        }
      } else {
        return {
          success: false,
          message: data.message || "Signup failed",
        }
      }
    } catch (error) {
      console.error("Signup error:", error)
      return {
        success: false,
        message: "Network error occurred. Please check your connection and try again.",
      }
    }
  }

  const logout = () => {
    localStorage.removeItem("auth_token")
    setUser(null)
    router.push("/")
  }

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
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

// For backward compatibility
export const useAuthContext = useAuth
