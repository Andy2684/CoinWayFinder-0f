"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"

export interface AdminUser {
  id: string
  username: string
  email: string
  role: string
  permissions: string[]
}

export interface AdminStats {
  totalUsers: number
  activeBots: number
  totalTrades: number
  systemHealth: string
  newsArticles: number
  whaleTransactions: number
}

export function useAdmin() {
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const checkAdminSession = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/me", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setAdmin(data.admin)
          setStats(data.stats)
        }
      }
    } catch (error) {
      console.error("Admin session check failed:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAdminSession()
  }, [checkAdminSession])

  const signIn = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/admin/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (data.success) {
        setAdmin(data.admin)
        toast.success("🔓 Admin access granted", {
          description: "You now have unlimited system access",
        })

        // Refresh stats
        await checkAdminSession()

        // Reload page to update all components
        setTimeout(() => {
          window.location.reload()
        }, 1000)

        return true
      } else {
        toast.error("Admin authentication failed", {
          description: data.error || "Invalid credentials",
        })
        return false
      }
    } catch (error) {
      console.error("Admin sign in error:", error)
      toast.error("Admin sign in failed", {
        description: "Network error occurred",
      })
      return false
    }
  }

  const signOut = async (): Promise<void> => {
    try {
      await fetch("/api/admin/signout", {
        method: "POST",
        credentials: "include",
      })

      setAdmin(null)
      setStats(null)

      toast.success("Admin session ended", {
        description: "You have been signed out of admin mode",
      })

      // Reload page to update all components
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error("Admin sign out error:", error)
    }
  }

  const refreshStats = async (): Promise<void> => {
    await checkAdminSession()
  }

  return {
    admin,
    stats,
    isLoading,
    isAdmin: !!admin,
    signIn,
    signOut,
    refreshStats,
  }
}
