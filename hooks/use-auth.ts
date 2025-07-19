"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface User {
  id: string
  email: string
  name: string
  firstName?: string
  lastName?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Demo users for testing
const DEMO_USERS = [
  {
    id: "1",
    email: "demo@coinwayfinder.com",
    password: "password",
    name: "Demo User",
    firstName: "Demo",
    lastName: "User",
  },
  {
    id: "2",
    email: "admin@coinwayfinder.com",
    password: "AdminPass123!",
    name: "Admin User",
    firstName: "Admin",
    lastName: "User",
  },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        localStorage.removeItem("user")
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const demoUser = DEMO_USERS.find((u) => u.email === email && u.password === password)

    if (demoUser) {
      const userData: User = {
        id: demoUser.id,
        email: demoUser.email,
        name: demoUser.name,
        firstName: demoUser.firstName,
        lastName: demoUser.lastName,
      }
      setUser(userData)
      localStorage.setItem("user", JSON.stringify(userData))
      toast.success("Successfully signed in!")
      setLoading(false)
      return true
    } else {
      toast.error("Invalid email or password")
      setLoading(false)
      return false
    }
  }

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    setLoading(true)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Check if user already exists
    const existingUser = DEMO_USERS.find((u) => u.email === email)
    if (existingUser) {
      toast.error("User already exists")
      setLoading(false)
      return false
    }

    // Create new user
    const nameParts = name.split(" ")
    const firstName = nameParts[0] || ""
    const lastName = nameParts.slice(1).join(" ") || ""

    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      firstName,
      lastName,
    }
    setUser(newUser)
    localStorage.setItem("user", JSON.stringify(newUser))
    toast.success("Account created successfully!")
    setLoading(false)
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    toast.success("Signed out successfully")
    router.push("/")
  }

  return (
    <AuthContext.Provider
      value={{
        user: user,
        loading: loading,
        login: login,
        signup: signup,
        logout: logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
