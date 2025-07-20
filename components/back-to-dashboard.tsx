"use client"

import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Home } from "lucide-react"
import Link from "next/link"

export function BackToDashboard() {
  return (
    <Link href="/dashboard">
      <Button variant="outline" size="sm" className="mb-4 bg-transparent">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>
    </Link>
  )
}

export function FloatingDashboardButton() {
  const { user } = useAuth()

  if (!user) {
    return null
  }

  return (
    <Link
      href="/dashboard"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
      aria-label="Go to Dashboard"
    >
      <Home className="h-6 w-6" />
    </Link>
  )
}
