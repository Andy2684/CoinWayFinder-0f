"use client"

import { useState, useEffect } from "react"

export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  username?: string
  role: "user" | "admin"
  isEmailVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

// Mock users for demo
const MOCK_USERS = [
  {
    id: "1",
    email: "demo@coinwayfinder.com",
    password: "password",
    firstName: "Demo",
    lastName: "User",
    username: "demo_user",
    role: "user" as const,
    isEmailVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    email: "admin@coinwayfinder.com",
    password: "admin123",
    firstName: "Admin",
    lastName: "User",
    username: "admin",
    role: "admin" as const,
    isEmailVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })

  useEffect(() => {
    // Check for stored auth token
    const token = localStorage.getItem("auth_token")
    const userData = localStorage.getItem("user_data")

    if (token && userData) {
      try {
        const user = JSON.parse(userData)
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
        })
      } catch (error) {
        console.error("Error parsing stored user data:", error)
        localStorage.removeItem("auth_token")
        localStorage.removeItem("user_data")
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        })
      }
    } else {
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      })
    }
  }, [])

  const login = async (email: string, password: string) => {
    setAuthState((prev) => ({ ...prev, isLoading: true }))

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Find user in mock data
      const mockUser = MOCK_USERS.find((u) => u.email === email && u.password === password)

      if (!mockUser) {
        throw new Error("Invalid email or password")
      }

      // Remove password from user object
      const { password: _, ...user } = mockUser

      // Store auth data
      const token = `mock_token_${user.id}_${Date.now()}`
      localStorage.setItem("auth_token", token)
      localStorage.setItem("user_data", JSON.stringify(user))

      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
      })

      return { success: true, user }
    } catch (error) {
      setAuthState((prev) => ({ ...prev, isLoading: false }))
      throw error
    }
  }

  const signup = async (userData: {
    email: string
    password: string
    firstName?: string
    lastName?: string
    username?: string
  }) => {
    setAuthState((prev) => ({ ...prev, isLoading: true }))

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Check if user already exists
      const existingUser = MOCK_USERS.find((u) => u.email === userData.email)
      if (existingUser) {
        throw new Error("User with this email already exists")
      }

      // Create new user
      const newUser: User = {
        id: `user_${Date.now()}`,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        username: userData.username || userData.email.split("@")[0],
        role: "user",
        isEmailVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // For demo purposes, we'll just return success without actually storing
      setAuthState((prev) => ({ ...prev, isLoading: false }))

      return { success: true, user: newUser }
    } catch (error) {
      setAuthState((prev) => ({ ...prev, isLoading: false }))
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_data")
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    })
  }

  const updateUser = async (updates: Partial<User>) => {
    if (!authState.user) return

    const updatedUser = { ...authState.user, ...updates, updatedAt: new Date().toISOString() }

    localStorage.setItem("user_data", JSON.stringify(updatedUser))
    setAuthState((prev) => ({
      ...prev,
      user: updatedUser,
    }))

    return updatedUser
  }

  return {
    ...authState,
    login,
    signup,
    logout,
    updateUser,
  }
}
