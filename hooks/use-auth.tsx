"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  username?: string
  role: "user" | "admin"
  subscriptionStatus: "free" | "starter" | "pro" | "enterprise"
  isEmailVerified: boolean
  lastLogin?: string
  createdAt: string
  updatedAt: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; error?: string }>
  logout: () => Promise<void>
  signup: (userData: {
    email: string
    password: string
    firstName: string
    lastName: string
    username?: string
    acceptTerms: boolean
  }) => Promise<{ success: boolean; message?: string; error?: string }>
  refreshUser: () => Promise<void>
  updateProfile: (updates: {
    firstName?: string
    lastName?: string
    username?: string
    email?: string
  }) => Promise<{ success: boolean; message?: string; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check authentication status on mount and refresh
  const checkAuth = async () => {
    try {
      setError(null)
      const response = await fetch("/api/auth/me", {
        credentials: "include",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      const data = await response.json()

      if (response.ok && data.success && data.user) {
        setUser(data.user)
        console.log("User authenticated:", data.user.email)
      } else {
        setUser(null)
        if (data.error && data.error !== "Not authenticated") {
          console.error("Auth check error:", data.error)
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      setUser(null)
      setError("Failed to check authentication status")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setError(null)
      setLoading(true)

      console.log("Attempting login for:", email)

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      })

      const data = await response.json()
      console.log("Login response:", { success: data.success, status: response.status })

      if (data.success && data.user) {
        setUser(data.user)
        console.log("Login successful for:", data.user.email)
        return { success: true, message: data.message }
      } else {
        console.error("Login failed:", data)
        setError(data.message || data.error || "Login failed")
        return {
          success: false,
          error: data.error || "Login failed",
          message: data.message || "Invalid credentials",
        }
      }
    } catch (error) {
      console.error("Login network error:", error)
      const errorMessage = "Network error occurred. Please check your connection and try again."
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setError(null)

      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })

      setUser(null)
      console.log("User logged out successfully")
    } catch (error) {
      console.error("Logout error:", error)
      // Still clear user state even if logout request fails
      setUser(null)
    }
  }

  const signup = async (userData: {
    email: string
    password: string
    firstName: string
    lastName: string
    username?: string
    acceptTerms: boolean
  }) => {
    try {
      setError(null)
      setLoading(true)

      console.log("Attempting signup for:", userData.email)

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(userData),
      })

      const data = await response.json()
      console.log("Signup response:", { success: data.success, status: response.status })

      if (data.success) {
        console.log("Signup successful for:", userData.email)
        // Don't auto-login after signup as requested
        return { success: true, message: data.message }
      } else {
        console.error("Signup failed:", data)
        setError(data.message || data.error || "Signup failed")
        return {
          success: false,
          error: data.error || "Signup failed",
          message: data.message || "Registration failed",
        }
      }
    } catch (error) {
      console.error("Signup network error:", error)
      const errorMessage = "Network error occurred. Please check your connection and try again."
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: {
    firstName?: string
    lastName?: string
    username?: string
    email?: string
  }) => {
    try {
      setError(null)

      console.log("Updating profile:", updates)

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updates),
      })

      const data = await response.json()
      console.log("Profile update response:", { success: data.success, status: response.status })

      if (data.success && data.user) {
        setUser(data.user)
        console.log("Profile updated successfully")
        return { success: true, message: data.message }
      } else {
        console.error("Profile update failed:", data)
        setError(data.message || data.error || "Profile update failed")
        return {
          success: false,
          error: data.error || "Update failed",
          message: data.message || "Failed to update profile",
        }
      }
    } catch (error) {
      console.error("Profile update network error:", error)
      const errorMessage = "Network error occurred. Please check your connection and try again."
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const refreshUser = async () => {
    setLoading(true)
    await checkAuth()
  }

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    signup,
    refreshUser,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
