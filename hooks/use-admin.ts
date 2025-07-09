"use client"

import { useState, useEffect } from "react"

interface AdminUser {
  id: string
  username: string
  email: string
  role: "admin"
  permissions: string[]
}

interface SystemStats {
  totalUsers: number
  activeUsers: number
  totalBots: number
  activeBots: number
  totalTrades: number
  todayTrades: number
  newsArticles: number
  whaleTransactions: number
  systemUptime: string
  lastUpdated: string
}

interface User {
  id: string
  email: string
  subscription: string
  botsCount: number
  tradesCount: number
  joinedAt: string
  lastActive: string
}

export function useAdmin() {
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAdminAuth()
  }, [])

  const checkAdminAuth = async () => {
    try {
      const response = await fetch("/api/admin/me")
      if (response.ok) {
        const data = await response.json()
        setAdmin(data.admin)
        await fetchSystemData()
      }
    } catch (error) {
      console.error("Admin auth check failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSystemData = async () => {
    try {
      const response = await fetch("/api/admin/users")
      if (response.ok) {
        const data = await response.json()
        setSystemStats(data.stats)
        setUsers(data.users)
      }
    } catch (error) {
      console.error("Failed to fetch system data:", error)
    }
  }

  const login = async (username: string, password: string) => {
    const response = await fetch("/api/admin/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })

    if (!response.ok) {
      throw new Error("Invalid credentials")
    }

    const data = await response.json()
    setAdmin(data.admin)
    await fetchSystemData()
  }

  const logout = async () => {
    try {
      await fetch("/api/admin/signout", { method: "POST" })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setAdmin(null)
      setSystemStats(null)
      setUsers([])
    }
  }

  const hasPermission = (permission: string): boolean => {
    return admin?.permissions.includes(permission) || admin?.role === "admin" || false
  }

  const isUnlimitedAccess = (): boolean => {
    return admin?.role === "admin" || false
  }

  return {
    admin,
    systemStats,
    users,
    isLoading,
    login,
    logout,
    hasPermission,
    isUnlimitedAccess,
    checkAdminAuth,
  }
}
