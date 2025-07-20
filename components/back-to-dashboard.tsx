"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Home } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"

export function BackToDashboard() {
  return (
    <Button variant="outline" size="sm" asChild>
      <Link href="/dashboard">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Link>
    </Button>
  )
}

export function FloatingDashboardButton() {
  const { user } = useAuth()

  // Only show for authenticated users
  if (!user) return null

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        size="lg"
        className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
        asChild
      >
        <Link href="/dashboard" aria-label="Go to Dashboard">
          <Home className="h-6 w-6" />
        </Link>
      </Button>
    </div>
  )
}
