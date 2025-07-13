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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored auth data on mount
    const storedToken = localStorage.getItem("auth_token")
    const storedUser = localStorage.getItem("auth_user")

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setToken(storedToken)
        setUser(parsedUser)
      } catch (error) {
        // Clear invalid stored data
        localStorage.removeItem("auth_token")
        localStorage.removeItem("auth_user")
      }
    }

    setIsLoading(false)
  }, [])

  const login = (newToken: string, newUser: User) => {
    setToken(newToken)
    setUser(newUser)
    localStorage.setItem("auth_token", newToken)
    localStorage.setItem("auth_user", JSON.stringify(newUser))
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem("auth_token")
    localStorage.removeItem("auth_user")
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

export { AuthContext }

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
