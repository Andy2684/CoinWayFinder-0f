"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<boolean>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock user database
const mockUsers: User[] = [
  {
    id: "1",
    email: "demo@coinwayfinder.com",
    firstName: "Demo",
    lastName: "User",
  },
  {
    id: "2",
    email: "admin@coinwayfinder.com",
    firstName: "Admin",
    lastName: "User",
  },
]

// Mock passwords (in real app, these would be hashed)
const mockPasswords: Record<string, string> = {
  "demo@coinwayfinder.com": "password",
  "admin@coinwayfinder.com": "AdminPass123!",
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem("coinwayfinder_user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        localStorage.removeItem("coinwayfinder_user")
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Check credentials
    const foundUser = mockUsers.find((u) => u.email === email)
    const correctPassword = mockPasswords[email]

    if (foundUser && correctPassword === password) {
      setUser(foundUser)
      localStorage.setItem("coinwayfinder_user", JSON.stringify(foundUser))
      setLoading(false)
      return true
    }

    setLoading(false)
    return false
  }

  const signup = async (email: string, password: string, firstName: string, lastName: string): Promise<boolean> => {
    setLoading(true)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Check if user already exists
    const existingUser = mockUsers.find((u) => u.email === email)
    if (existingUser) {
      setLoading(false)
      return false
    }

    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      email,
      firstName,
      lastName,
    }

    // Add to mock database
    mockUsers.push(newUser)
    mockPasswords[email] = password

    setLoading(false)
    return true
  }

  const logout = async (): Promise<void> => {
    setUser(null)
    localStorage.removeItem("coinwayfinder_user")
    router.push("/")
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    signup,
    logout,
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
