"use client"

import { useContext } from "react"
import { createContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

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
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock users database
const mockUsers = [
  {
    id: "1",
    email: "demo@coinwayfinder.com",
    password: "password",
    name: "Demo User",
    avatar: "/placeholder-user.jpg",
  },
  {
    id: "2",
    email: "admin@coinwayfinder.com",
    password: "AdminPass123!",
    name: "Admin User",
    avatar: "/placeholder-user.jpg",
  },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const foundUser = mockUsers.find((u) => u.email === email && u.password === password)

    if (foundUser) {
      const userData = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        avatar: foundUser.avatar,
      }
      setUser(userData)
      localStorage.setItem("user", JSON.stringify(userData))
      setLoading(false)
      router.push("/dashboard")
      return true
    }

    setLoading(false)
    return false
  }

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    setLoading(true)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Check if user already exists
    const existingUser = mockUsers.find((u) => u.email === email)
    if (existingUser) {
      setLoading(false)
      return false
    }

    // Add new user to mock database
    const newUser = {
      id: Date.now().toString(),
      email,
      password,
      name,
      avatar: "/placeholder-user.jpg",
    }
    mockUsers.push(newUser)

    setLoading(false)
    router.push("/thank-you")
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    router.push("/")
  }

  return <AuthContext.Provider value={{ user, login, signup, logout, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
