"use client"
import type { ReactNode } from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  username: string
  role: string
  plan: string
  isVerified: boolean
  permissions?: {
    fullAccess?: boolean
    manageUsers?: boolean
    systemSettings?: boolean
    allExchanges?: boolean
    unlimitedBots?: boolean
    advancedAnalytics?: boolean
    prioritySupport?: boolean
  }
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (token: string, user: User) => void
  logout: () => void
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  hasPermission: (permission: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Mock users for demo
const mockUsers = [
  {
    id: "1",
    email: "demo@coinwayfinder.com",
    password: "password",
    firstName: "Demo",
    lastName: "User",
    username: "demoUser",
    role: "user",
    plan: "pro",
    isVerified: true,
  },
  {
    id: "2",
    email: "admin@coinwayfinder.com",
    password: "admin123",
    firstName: "Admin",
    lastName: "User",
    username: "adminUser",
    role: "admin",
    plan: "enterprise",
    isVerified: true,
    permissions: {
      fullAccess: true,
      manageUsers: true,
      systemSettings: true,
      allExchanges: true,
      unlimitedBots: true,
      advancedAnalytics: true,
      prioritySupport: true,
    },
  },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for existing session
    const storedToken = localStorage.getItem("auth_token")
    const storedUser = localStorage.getItem("auth_user")

    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        localStorage.removeItem("auth_token")
        localStorage.removeItem("auth_user")
      }
    }

    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      // Mock authentication
      const mockUser = mockUsers.find((u) => u.email === email && u.password === password)

      if (!mockUser) {
        return { success: false, error: "Invalid credentials" }
      }

      const { password: _, ...userWithoutPassword } = mockUser
      const newToken = `mock-token-${mockUser.id}`

      setToken(newToken)
      setUser(userWithoutPassword)
      localStorage.setItem("auth_token", newToken)
      localStorage.setItem("auth_user", JSON.stringify(userWithoutPassword))

      return { success: true, user: userWithoutPassword }
    } catch (error) {
      return { success: false, error: "Login failed" }
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem("auth_token")
    localStorage.removeItem("auth_user")
    router.push("/auth/login")
  }

  const signup = async (email: string, password: string, firstName: string, lastName: string, username: string) => {
    try {
      // Mock signup - in real app, this would call your API
      const existingUser = mockUsers.find((u) => u.email === email)

      if (existingUser) {
        return { success: false, error: "User already exists" }
      }

      // For demo, we'll just simulate success
      const newUser: User = {
        id: "3",
        email,
        firstName,
        lastName,
        username,
        role: "user",
        plan: "basic",
        isVerified: false,
      }

      return { success: true, user: newUser }
    } catch (error) {
      return { success: false, error: "Signup failed" }
    }
  }

  const isAuthenticated = !!user && !!token
  const isAdmin = user?.role === "owner" || user?.role === "admin"

  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    if (user.role === "owner") return true // Owner has all permissions
    if (user.permissions?.fullAccess) return true

    switch (permission) {
      case "manageUsers":
        return user.permissions?.manageUsers || false
      case "systemSettings":
        return user.permissions?.systemSettings || false
      case "allExchanges":
        return user.permissions?.allExchanges || false
      case "unlimitedBots":
        return user.permissions?.unlimitedBots || false
      case "advancedAnalytics":
        return user.permissions?.advancedAnalytics || false
      case "prioritySupport":
        return user.permissions?.prioritySupport || false
      default:
        return false
    }
  }

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isLoading,
    isAuthenticated,
    isAdmin,
    hasPermission,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Export AuthContext as named export
export { AuthContext }
