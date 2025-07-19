"use client"

import { createContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import {
  AuthProvider,
  type User as MainUser,
  type AuthContextType as MainAuthContextType,
} from "@/components/auth/auth-provider"

// Re-export everything from the main auth provider
export { useAuth, AuthProvider, type User, type AuthContextType } from "@/components/auth/auth-provider"

interface AuthContextType extends MainAuthContextType {
  // Additional auth context fields can be added here if needed
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock users database
const MOCK_USERS: MainUser[] = [
  {
    id: "1",
    email: "demo@coinwayfinder.com",
    firstName: "Demo",
    lastName: "User",
    role: "user",
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    email: "admin@coinwayfinder.com",
    firstName: "Admin",
    lastName: "User",
    role: "admin",
    createdAt: "2024-01-01T00:00:00Z",
  },
]

const MOCK_PASSWORDS: Record<string, string> = {
  "demo@coinwayfinder.com": "password",
  "admin@coinwayfinder.com": "AdminPass123!",
}

export function AuthProviderWrapper({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MainUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

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
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const mockUser = MOCK_USERS.find((u) => u.email === email)
    const correctPassword = MOCK_PASSWORDS[email]

    if (mockUser && correctPassword === password) {
      setUser(mockUser)
      localStorage.setItem("coinwayfinder_user", JSON.stringify(mockUser))
      setLoading(false)
      router.push("/dashboard")
      return true
    }

    setLoading(false)
    return false
  }

  const signup = async (userData: {
    email: string
    password: string
    firstName: string
    lastName: string
  }): Promise<boolean> => {
    setLoading(true)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Check if user already exists
    const existingUser = MOCK_USERS.find((u) => u.email === userData.email)
    if (existingUser) {
      setLoading(false)
      return false
    }

    // Create new user
    const newUser: MainUser = {
      id: Date.now().toString(),
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: "user",
      createdAt: new Date().toISOString(),
    }

    // Add to mock database
    MOCK_USERS.push(newUser)
    MOCK_PASSWORDS[userData.email] = userData.password

    setLoading(false)
    router.push("/thank-you")
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("coinwayfinder_user")
    router.push("/")
  }

  return <AuthProvider value={{ user, loading, login, signup, logout }}>{children}</AuthProvider>
}
