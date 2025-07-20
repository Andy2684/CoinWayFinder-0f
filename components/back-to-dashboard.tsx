"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, LayoutDashboard } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth/auth-provider"

export function BackToDashboard() {
  const [mounted, setMounted] = useState(false)
  const { user, loading } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || loading) {
    return (
      <Button variant="outline" size="sm" disabled className="bg-transparent">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Dashboard
      </Button>
    )
  }

  if (!user) {
    return null
  }

  return (
    <Button asChild variant="outline" size="sm" className="bg-transparent">
      <Link href="/dashboard">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Link>
    </Button>
  )
}

export function FloatingDashboardButton() {
  const [mounted, setMounted] = useState(false)
  const { user, loading } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || loading || !user) {
    return null
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button asChild size="lg" className="rounded-full shadow-lg bg-blue-600 hover:bg-blue-700">
        <Link href="/dashboard">
          <LayoutDashboard className="h-5 w-5 mr-2" />
          Dashboard
        </Link>
      </Button>
    </div>
  )
}
