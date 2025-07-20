"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"

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

export interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User }>
  signup: (userData: {
    email: string
    password: string
    firstName?: string
    lastName?: string
    username?: string
  }) => Promise<{ success: boolean; user?: User }>
  logout: () => void
  updateUser: (updates: Partial<User>) => Promise<User | undefined>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock users for demo - these will be updated when users register
const INITIAL_MOCK_USERS = [
  {
    id: "1",
    email: "demo@coinwayfinder.com",
    password: "password",
    firstName: "Demo",
    lastName: "User",
    username: "demo_user",
    role: "user" as const,
    isEmailVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    email: "admin@coinwayfinder.com",
    password: "admin123",
    firstName: "Admin",
    lastName: "User",
    username: "admin",
    role: "admin" as const,
    isEmailVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

// Get users from localStorage or use initial mock users
function getMockUsers() {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("mock_users")
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        return INITIAL_MOCK_USERS
      }
    }
  }
  return INITIAL_MOCK_USERS
}

// Save users to localStorage
function saveMockUsers(users: any[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem("mock_users", JSON.stringify(users))
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for stored auth token on mount
    const token = localStorage.getItem("auth_token")
    const userData = localStorage.getItem("user_data")

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
      } catch (error) {
        console.error("Error parsing stored user data:", error)
        localStorage.removeItem("auth_token")
        localStorage.removeItem("user_data")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; user?: User }> => {
    setIsLoading(true)

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Get current users (including newly registered ones)
      const mockUsers = getMockUsers()

      // Find user in mock data
      const mockUser = mockUsers.find((u: any) => u.email === email && u.password === password)

      if (!mockUser) {
        setIsLoading(false)
        throw new Error("Invalid email or password")
      }

      // Remove password from user object
      const { password: _, ...userWithoutPassword } = mockUser

      // Store auth data
      const token = `mock_token_${userWithoutPassword.id}_${Date.now()}`
      localStorage.setItem("auth_token", token)
      localStorage.setItem("user_data", JSON.stringify(userWithoutPassword))

      setUser(userWithoutPassword)
      setIsLoading(false)

      // Redirect to dashboard
      router.push("/dashboard")
      router.refresh()

      return { success: true, user: userWithoutPassword }
    } catch (error) {
      setIsLoading(false)
      throw error
    }
  }

  const signup = async (userData: {
    email: string
    password: string
    firstName?: string
    lastName?: string
    username?: string
  }): Promise<{ success: boolean; user?: User }> => {
    setIsLoading(true)

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Get current users
      const mockUsers = getMockUsers()

      // Check if user already exists
      const existingUser = mockUsers.find((u: any) => u.email === userData.email)
      if (existingUser) {
        setIsLoading(false)
        throw new Error("User with this email already exists")
      }

      // Create new user
      const newUser = {
        id: `user_${Date.now()}`,
        email: userData.email,
        password: userData.password, // Store password for mock authentication
        firstName: userData.firstName,
        lastName: userData.lastName,
        username: userData.username || userData.email.split("@")[0],
        role: "user" as const,
        isEmailVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Add new user to mock users and save to localStorage
      const updatedUsers = [...mockUsers, newUser]
      saveMockUsers(updatedUsers)

      setIsLoading(false)

      // Redirect to thank you page without logging in
      router.push("/thank-you")

      // Return user without password
      const { password: _, ...userWithoutPassword } = newUser
      return { success: true, user: userWithoutPassword }
    } catch (error) {
      setIsLoading(false)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_data")
    setUser(null)
    router.push("/")
    router.refresh()
  }

  const updateUser = async (updates: Partial<User>): Promise<User | undefined> => {
    if (!user) return

    const updatedUser = { ...user, ...updates, updatedAt: new Date().toISOString() }

    localStorage.setItem("user_data", JSON.stringify(updatedUser))
    setUser(updatedUser)

    return updatedUser
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Export useAuthContext as an alias for backward compatibility
export const useAuthContext = useAuth
