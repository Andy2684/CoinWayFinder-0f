"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"

interface AdminUser {
  username: string
  email: string
  role: string
}

interface AdminStats {
  totalUsers: number
  activeBots: number
  totalTrades: number
  newsArticles: number
  whaleTransactions: number
  systemUptime: string
  lastUpdated: string
}

export function useAdmin() {
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<AdminStats | null>(null)

  useEffect(() => {
    checkAdminStatus()
  }, [])

  const checkAdminStatus = async () => {
    try {
      const response = await fetch("/api/admin/me")
      if (response.ok) {
        const data = await response.json()
        setAdmin(data.admin)
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Error checking admin status:", error)
    }
  }

  const login = async (username: string, password: string) => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setAdmin(data.admin)
        toast.success("Admin access granted")
        await checkAdminStatus() // Refresh stats
      } else {
        toast.error(data.error || "Invalid credentials")
      }
    } catch (error) {
      toast.error("Login failed")
      console.error("Admin login error:", error)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/admin/signout", { method: "POST" })
      setAdmin(null)
      setStats(null)
      toast.success("Signed out")
    } catch (error) {
      console.error("Admin logout error:", error)
    }
  }

  return {
    admin,
    stats,
    login,
    logout,
    loading,
    isAdmin: !!admin,
  }
}
