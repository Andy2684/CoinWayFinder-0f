
"use client"

import type React from "react"

import { useAuth } from "./auth-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean

'use client'

import { useRouter } from 'next/navigation'
import { ReactNode, useEffect } from 'react'
import { useAuth } from '@/context/auth-context'

type ProtectedRouteProps = {
  children: ReactNode
  requiredRole?: string

  redirectTo?: string
}

export function ProtectedRoute({ children, requireAuth = true, redirectTo = "/auth/login" }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {

    if (!loading) {
      if (requireAuth && !user) {
        router.push(redirectTo)
      } else if (!requireAuth && user) {
        router.push("/dashboard")
      }

    if (!loading && (!isAuthenticated || (requiredRole && user?.role !== requiredRole))) {
      router.replace(redirectTo)

    }
  }, [user, loading, requireAuth, redirectTo, router])


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  if (requireAuth && !user) {
    return null
  }

  if (!requireAuth && user) {

  if (loading || !isAuthenticated) {

    return null
  }

  return <>{children}</>
}

export default ProtectedRoute
