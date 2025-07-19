"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  username: string
  role: "user" | "admin"
  plan: string
  isVerified: boolean
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (userData: any) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Local mock users - no external API calls
const mockUsers = [
  {
    id: "1",
    email: "demo@coinwayfinder.com",
    password: "password",
    firstName: "Demo",
    lastName: "User",
    username: "demo_user",
    role: "user" as const,
    plan: "free",
    isVerified: true,
  },
  {
    id: "2",
    email: "admin@coinwayfinder.com",
    password: "AdminPass123!",
    firstName: "Admin",
    lastName: "User",
    username: "admin_user",
    role: "admin" as const,
    plan: "enterprise",
    isVerified: true,
  },
]

export function useAuthProvider(): AuthContextType {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const userData = getStoredUser()
      if (userData) {
        setUser(userData)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      removeStoredUser()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Find user in mock data
      const foundUser = mockUsers.find((u) => u.email === email && u.password === password)

      if (!foundUser) {
        return { success: false, error: "Invalid email or password" }
      }

      // Remove password from user object
      const { password: _, ...userWithoutPassword } = foundUser

      // Store user data locally
      storeUser(userWithoutPassword)
      setUser(userWithoutPassword)

      return { success: true }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, error: "Login failed" }
    }
  }

  const signup = async (userData: any) => {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Check if user already exists
      const existingUser = mockUsers.find((u) => u.email === userData.email)
      if (existingUser) {
        return { success: false, error: "User already exists" }
      }

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        email: userData.email,
        firstName: userData.firstName || userData.name?.split(" ")[0] || "User",
        lastName: userData.lastName || userData.name?.split(" ")[1] || "",
        username: userData.email.split("@")[0],
        role: "user" as const,
        plan: "free",
        isVerified: false,
      }

      // Add to mock users (in real app, this would be saved to database)
      mockUsers.push({ ...newUser, password: userData.password })

      // Don't automatically log in after signup
      // Just redirect to thank you page
      router.push("/thank-you")
      return { success: true }
    } catch (error) {
      console.error("Signup error:", error)
      return { success: false, error: "Registration failed" }
    }
  }

  const logout = async () => {
    try {
      removeStoredUser()
      setUser(null)
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
  }
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Local storage utility functions
function storeUser(user: User) {
  if (typeof window !== "undefined") {
    localStorage.setItem("coinwayfinder-user", JSON.stringify(user))
  }
}

function getStoredUser(): User | null {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("coinwayfinder-user")
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        return null
      }
    }
  }
  return null
}

function removeStoredUser() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("coinwayfinder-user")
  }
}
