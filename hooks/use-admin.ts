"use client"

import { useState, useEffect } from "react"

interface AdminUser {
  id: string
  username: string
  email: string
  role: "admin"
  permissions: string[]
}

export function useAdmin() {
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAdminStatus()
  }, [])

  const checkAdminStatus = async () => {
    try {
      const response = await fetch("/api/admin/me")
      const data = await response.json()

      if (data.success) {
        setAdmin(data.admin)
      } else {
        setAdmin(null)
      }
    } catch (error) {
      setAdmin(null)
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      await fetch("/api/admin/signout", { method: "POST" })
      setAdmin(null)
      window.location.reload()
    } catch (error) {
      console.error("Admin signout error:", error)
    }
  }

  return {
    admin,
    loading,
    isAdmin: !!admin,
    signOut,
    checkAdminStatus,
  }
}
