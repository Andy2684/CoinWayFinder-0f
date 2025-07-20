"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  name?: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  signup: (userData: { email: string; password: string; firstName: string; lastName: string }) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock users data
const initialMockUsers = [
  {
    id: "1",
    email: "demo@coinwayfinder.com",
    password: "password",
    firstName: "Demo",
    lastName: "User",
    name: "Demo User",
  },
  {
    id: "2",
    email: "admin@coinwayfinder.com",
    password: "admin123",
    firstName: "Admin",
    lastName: "User",
    name: "Admin User",
  },
]

// Helper functions for localStorage
const getMockUsers = () => {
  if (typeof window === "undefined") return initialMockUsers
  const stored = localStorage.getItem("mock_users")
  return stored ? JSON.parse(stored) : initialMockUsers
}

const saveMockUsers = (users: any[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("mock_users", JSON.stringify(users))
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for existing auth token
    const token = localStorage.getItem("auth_token")
    const userData = localStorage.getItem("user_data")

    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error("Error parsing user data:", error)
        localStorage.removeItem("auth_token")
        localStorage.removeItem("user_data")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockUsers = getMockUsers()
      const foundUser = mockUsers.find((u: any) => u.email === email && u.password === password)

      if (foundUser) {
        const userData = {
          id: foundUser.id,
          email: foundUser.email,
          firstName: foundUser.firstName,
          lastName: foundUser.lastName,
          name: foundUser.name || `${foundUser.firstName} ${foundUser.lastName}`,
        }

        setUser(userData)
        localStorage.setItem("auth_token", "mock_token_" + Date.now())
        localStorage.setItem("user_data", JSON.stringify(userData))

        setIsLoading(false)
        router.push("/dashboard")
        return true
      }

      setIsLoading(false)
      return false
    } catch (error) {
      console.error("Login error:", error)
      setIsLoading(false)
      return false
    }
  }

  const signup = async (userData: {
    email: string
    password: string
    firstName: string
    lastName: string
  }): Promise<boolean> => {
    setIsLoading(true)

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockUsers = getMockUsers()

      // Check if user already exists
      const existingUser = mockUsers.find((u: any) => u.email === userData.email)
      if (existingUser) {
        setIsLoading(false)
        return false
      }

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        name: `${userData.firstName} ${userData.lastName}`,
      }

      const updatedUsers = [...mockUsers, newUser]
      saveMockUsers(updatedUsers)

      setIsLoading(false)
      router.push("/thank-you")
      return true
    } catch (error) {
      console.error("Signup error:", error)
      setIsLoading(false)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_data")
    router.push("/")
  }

  return <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Export the context for compatibility
export const useAuthContext = useAuth
export { AuthContext }
export default AuthProvider
