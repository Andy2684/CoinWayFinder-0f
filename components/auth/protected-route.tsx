"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireAdmin?: boolean
}

export function ProtectedRoute({ children, requireAuth = true, requireAdmin = false }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      if (!isLoading) {
        if (requireAuth && !isAuthenticated) {
          router.push("/auth/login")
          return
        }

        if (requireAdmin && (!user || user.role !== "admin")) {
          router.push("/dashboard")
          return
        }

        setIsChecking(false)
      }
    }

    checkAuth()
  }, [isAuthenticated, isLoading, requireAuth, requireAdmin, user, router])

  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-400" />
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }

  if (requireAuth && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="text-center">
          <p className="text-white">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  if (requireAdmin && (!user || user.role !== "admin")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="text-center">
          <p className="text-white">Access denied. Admin privileges required.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
