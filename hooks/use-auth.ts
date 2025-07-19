"use client"

import { createContext, useContext, useState, useEffect } from "react"

export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  username?: string
  role: "user" | "admin"
  isEmailVerified: boolean
  createdAt: string
  updatedAt: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
  ) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Mock users for demo
const DEMO_USERS: User[] = [
  {
    id: "1",
    email: "demo@coinwayfinder.com",
    firstName: "Demo",
    lastName: "User",
    username: "demo",
    role: "user",
    isEmailVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    email: "admin@coinwayfinder.com",
    firstName: "Admin",
    lastName: "User",
    username: "admin",
    role: "admin",
    isEmailVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export function useAuthLogic() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem("coinwayfinder_user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Error parsing stored user:", error)
        localStorage.removeItem("coinwayfinder_user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Check demo users
      const demoUser = DEMO_USERS.find((u) => u.email === email)
      if (demoUser && password === "password") {
        setUser(demoUser)
        localStorage.setItem("coinwayfinder_user", JSON.stringify(demoUser))
        return { success: true }
      }

      // For other emails, create a new user
      if (email && password) {
        const newUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          email,
          firstName: email.split("@")[0],
          role: "user",
          isEmailVerified: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        setUser(newUser)
        localStorage.setItem("coinwayfinder_user", JSON.stringify(newUser))
        return { success: true }
      }

      return { success: false, error: "Invalid credentials" }
    } catch (error) {
      return { success: false, error: "Login failed" }
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (email: string, password: string, firstName?: string, lastName?: string) => {
    setIsLoading(true)

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Check if user already exists
      const existingUser = DEMO_USERS.find((u) => u.email === email)
      if (existingUser) {
        return { success: false, error: "User already exists" }
      }

      // Create new user
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        firstName: firstName || email.split("@")[0],
        lastName,
        role: "user",
        isEmailVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Don't auto-login after signup, just return success
      return { success: true }
    } catch (error) {
      return { success: false, error: "Signup failed" }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("coinwayfinder_user")
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
  }
}
