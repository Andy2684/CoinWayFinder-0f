"use client"

import { ArrowLeft, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth/auth-provider"
import Link from "next/link"

export function BackToDashboard() {
  return (
    <Link href="/dashboard">
      <Button variant="outline" className="mb-4 bg-transparent">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>
    </Link>
  )
}

export function FloatingDashboardButton() {
  const { user } = useAuth()

  // Only show for authenticated users
  if (!user) {
    return null
  }

  return (
    <Link href="/dashboard">
      <Button
        size="lg"
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
        aria-label="Go to Dashboard"
      >
        <Home className="h-6 w-6" />
      </Button>
    </Link>
  )
}
