"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

interface User {
  id: string
  email: string
  name: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  signup: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// For backward compatibility
export const useAuthContext = useAuth

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing user session
    const userData = localStorage.getItem("user")
    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error("Error parsing user data:", error)
        localStorage.removeItem("user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      // Get existing users from localStorage
      const existingUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")

      // Check demo account
      if (email === "demo@coinwayfinder.com" && password === "password") {
        const demoUser = {
          id: "demo-user",
          email: "demo@coinwayfinder.com",
          name: "Demo User",
          avatar: "/placeholder-user.jpg",
        }
        setUser(demoUser)
        localStorage.setItem("user", JSON.stringify(demoUser))
        return true
      }

      // Check registered users
      const foundUser = existingUsers.find((u: any) => u.email === email && u.password === password)
      if (foundUser) {
        const userData = {
          id: foundUser.id,
          email: foundUser.email,
          name: foundUser.name,
          avatar: foundUser.avatar,
        }
        setUser(userData)
        localStorage.setItem("user", JSON.stringify(userData))
        return true
      }

      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      // Get existing users
      const existingUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")

      // Check if user already exists
      if (existingUsers.some((u: any) => u.email === email)) {
        return false
      }

      // Create new user
      const newUser = {
        id: `user-${Date.now()}`,
        email,
        password,
        name,
        avatar: "/placeholder-user.jpg",
        createdAt: new Date().toISOString(),
      }

      // Save to registered users
      existingUsers.push(newUser)
      localStorage.setItem("registeredUsers", JSON.stringify(existingUsers))

      // Auto-login the new user
      const userData = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        avatar: newUser.avatar,
      }
      setUser(userData)
      localStorage.setItem("user", JSON.stringify(userData))

      return true
    } catch (error) {
      console.error("Signup error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  const value = {
    user,
    login,
    signup,
    logout,
    isLoading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthContext }
export default AuthProvider
