"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { User } from "@/lib/auth"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (user: User, token: string) => void
  logout: () => void
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check for stored token
        const token = localStorage.getItem("auth-token")
        if (!token) {
          setIsLoading(false)
          return
        }

        // Verify token with server
        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.user) {
            setUser(data.user)
            localStorage.setItem("user", JSON.stringify(data.user))
          } else {
            // Invalid token
            localStorage.removeItem("auth-token")
            localStorage.removeItem("user")
          }
        } else {
          // Token expired or invalid
          localStorage.removeItem("auth-token")
          localStorage.removeItem("user")
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
        localStorage.removeItem("auth-token")
        localStorage.removeItem("user")
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = (userData: User, token: string) => {
    setUser(userData)
    localStorage.setItem("auth-token", token)
    localStorage.setItem("user", JSON.stringify(userData))
  }

  const logout = async () => {
    try {
      // Call logout endpoint to clear server-side session
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
      })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      // Clear client-side data regardless of server response
      setUser(null)
      localStorage.removeItem("auth-token")
      localStorage.removeItem("user")
    }
  }

  const updateUser = (userData: User) => {
    setUser(userData)
    localStorage.setItem("user", JSON.stringify(userData))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        updateUser,
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
