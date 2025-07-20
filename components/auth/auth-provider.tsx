"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock users data with localStorage persistence
const getMockUsers = () => {
  if (typeof window === "undefined") return []

  const initialUsers = [
    { id: "1", email: "demo@coinwayfinder.com", password: "password", name: "Demo User", role: "user" },
    { id: "2", email: "admin@coinwayfinder.com", password: "admin123", name: "Admin User", role: "admin" },
  ]

  const storedUsers = localStorage.getItem("mock_users")
  if (storedUsers) {
    try {
      const parsedUsers = JSON.parse(storedUsers)
      // Merge initial users with stored users, avoiding duplicates
      const allUsers = [...initialUsers]
      parsedUsers.forEach((storedUser: any) => {
        if (!allUsers.find((u) => u.email === storedUser.email)) {
          allUsers.push(storedUser)
        }
      })
      return allUsers
    } catch {
      return initialUsers
    }
  }

  return initialUsers
}

const saveMockUsers = (users: any[]) => {
  if (typeof window === "undefined") return

  // Only save non-initial users to localStorage
  const initialEmails = ["demo@coinwayfinder.com", "admin@coinwayfinder.com"]
  const usersToSave = users.filter((user) => !initialEmails.includes(user.email))
  localStorage.setItem("mock_users", JSON.stringify(usersToSave))
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem("auth_token")
    const userData = localStorage.getItem("user_data")

    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
      } catch {
        localStorage.removeItem("auth_token")
        localStorage.removeItem("user_data")
      }
    }

    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true)

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const users = getMockUsers()
      const foundUser = users.find((u) => u.email === email && u.password === password)

      if (foundUser) {
        const userData = {
          id: foundUser.id,
          email: foundUser.email,
          name: foundUser.name,
          role: foundUser.role,
        }

        setUser(userData)
        localStorage.setItem("auth_token", "mock_token_" + foundUser.id)
        localStorage.setItem("user_data", JSON.stringify(userData))

        setLoading(false)
        return true
      }

      setLoading(false)
      return false
    } catch {
      setLoading(false)
      return false
    }
  }

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    setLoading(true)

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const users = getMockUsers()

      // Check if user already exists
      if (users.find((u) => u.email === email)) {
        setLoading(false)
        return false
      }

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        email,
        password,
        name,
        role: "user",
      }

      const updatedUsers = [...users, newUser]
      saveMockUsers(updatedUsers)

      setLoading(false)
      return true
    } catch {
      setLoading(false)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_data")
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

export default AuthProvider
