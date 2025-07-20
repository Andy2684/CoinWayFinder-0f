"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  username: string
  role: string
  plan: string
  isVerified: boolean
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  signup: (userData: any) => Promise<{ success: boolean; message?: string }>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem("auth_token")
    if (token) {
      // Simulate checking token validity
      try {
        const userData = localStorage.getItem("user_data")
        if (userData) {
          setUser(JSON.parse(userData))
        }
      } catch (error) {
        localStorage.removeItem("auth_token")
        localStorage.removeItem("user_data")
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)

      // Mock login - in real app, this would be an API call
      if (email === "demo@coinwayfinder.com" && password === "password") {
        const mockUser: User = {
          id: "1",
          email: "demo@coinwayfinder.com",
          firstName: "Demo",
          lastName: "User",
          username: "demo_user",
          role: "user",
          plan: "pro",
          isVerified: true,
        }

        localStorage.setItem("auth_token", "mock_token_123")
        localStorage.setItem("user_data", JSON.stringify(mockUser))
        setUser(mockUser)
        return true
      }

      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const signup = async (userData: any): Promise<{ success: boolean; message?: string }> => {
    try {
      setLoading(true)

      // Mock signup - in real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Don't automatically log in after signup
      return {
        success: true,
        message: "Account created successfully! Please check your email to verify your account.",
      }
    } catch (error) {
      console.error("Signup error:", error)
      return {
        success: false,
        message: "Failed to create account. Please try again.",
      }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_data")
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout, signup, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Backward compatibility export
export const useAuthContext = useAuth
