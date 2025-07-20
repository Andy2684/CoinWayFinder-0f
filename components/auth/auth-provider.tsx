"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  name: string
  avatar?: string
  role?: string
}

interface SignupData {
  email: string
  password: string
  firstName: string
  lastName: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  signup: (userData: SignupData) => Promise<boolean>
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

// Demo users
const DEMO_USERS = [
  {
    id: "demo-1",
    email: "demo@coinwayfinder.com",
    password: "password",
    firstName: "Demo",
    lastName: "User",
    name: "Demo User",
    avatar: "/placeholder-user.jpg",
    role: "user",
  },
  {
    id: "admin-1",
    email: "admin@coinwayfinder.com",
    password: "admin123",
    firstName: "Admin",
    lastName: "User",
    name: "Admin User",
    avatar: "/placeholder-user.jpg",
    role: "admin",
  },
]

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for existing user session
    const userData = localStorage.getItem("auth_user")
    const authToken = localStorage.getItem("auth_token")

    if (userData && authToken) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
      } catch (error) {
        console.error("Error parsing user data:", error)
        localStorage.removeItem("auth_user")
        localStorage.removeItem("auth_token")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Check demo users first
      const demoUser = DEMO_USERS.find((u) => u.email === email && u.password === password)
      if (demoUser) {
        const userData = {
          id: demoUser.id,
          email: demoUser.email,
          firstName: demoUser.firstName,
          lastName: demoUser.lastName,
          name: demoUser.name,
          avatar: demoUser.avatar,
          role: demoUser.role,
        }

        setUser(userData)
        localStorage.setItem("auth_user", JSON.stringify(userData))
        localStorage.setItem("auth_token", `token_${demoUser.id}_${Date.now()}`)

        setIsLoading(false)
        router.push("/dashboard")
        return true
      }

      // Check registered users
      const registeredUsers = JSON.parse(localStorage.getItem("registered_users") || "[]")
      const foundUser = registeredUsers.find((u: any) => u.email === email && u.password === password)

      if (foundUser) {
        const userData = {
          id: foundUser.id,
          email: foundUser.email,
          firstName: foundUser.firstName,
          lastName: foundUser.lastName,
          name: foundUser.name,
          avatar: foundUser.avatar || "/placeholder-user.jpg",
          role: foundUser.role || "user",
        }

        setUser(userData)
        localStorage.setItem("auth_user", JSON.stringify(userData))
        localStorage.setItem("auth_token", `token_${foundUser.id}_${Date.now()}`)

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

  const signup = async (userData: SignupData): Promise<boolean> => {
    setIsLoading(true)

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const { email, password, firstName, lastName } = userData

      // Validate required fields
      if (!email || !password || !firstName || !lastName) {
        console.error("Missing required fields")
        setIsLoading(false)
        return false
      }

      // Get existing users
      const existingUsers = JSON.parse(localStorage.getItem("registered_users") || "[]")
      const allUsers = [...DEMO_USERS, ...existingUsers]

      // Check if user already exists
      if (allUsers.some((u: any) => u.email === email)) {
        console.error("User already exists")
        setIsLoading(false)
        return false
      }

      // Create new user
      const newUser = {
        id: `user_${Date.now()}`,
        email,
        password,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        avatar: "/placeholder-user.jpg",
        role: "user",
        createdAt: new Date().toISOString(),
      }

      // Save to registered users
      existingUsers.push(newUser)
      localStorage.setItem("registered_users", JSON.stringify(existingUsers))

      setIsLoading(false)
      // Don't auto-login, redirect to thank you page
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
    localStorage.removeItem("auth_user")
    localStorage.removeItem("auth_token")
    router.push("/")
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
