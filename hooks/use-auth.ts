"use client"

import { useState, useEffect } from "react"

interface AuthUser {
  id: string
  email: string
  name: string
  subscription?: {
    plan: string
    status: string
    endDate: Date
  }
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/me")
      const data = await response.json()

      if (data.success) {
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" })
      setUser(null)
      window.location.href = "/"
    } catch (error) {
      console.error("Signout error:", error)
    }
  }

  return {
    user,
    loading,
    isAuthenticated: !!user,
    signOut,
    checkAuthStatus,
  }
}
