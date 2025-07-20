"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  email: string
  name?: string
  firstName?: string
  lastName?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Demo login logic
      if (email === "demo@coinwayfinder.com" && password === "password") {
        const demoUser: User = {
          id: "demo-user",
          email: "demo@coinwayfinder.com",
          name: "Demo User",
          firstName: "Demo",
          lastName: "User",
        }
        setUser(demoUser)
        localStorage.setItem("user", JSON.stringify(demoUser))
        setIsLoading(false)
        router.push("/dashboard")
        return true
      }

      // Regular login logic (simplified)
      if (email && password) {
        const newUser: User = {
          id: "user-" + Date.now(),
          email,
          name: email.split("@")[0],
          firstName: email.split("@")[0],
        }
        setUser(newUser)
        localStorage.setItem("user", JSON.stringify(newUser))
        setIsLoading(false)
        router.push("/dashboard")
        return true
      }

      setIsLoading(false)
      return false
    } catch (error) {
      setIsLoading(false)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    router.push("/")
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
