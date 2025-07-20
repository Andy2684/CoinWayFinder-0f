"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Home } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

interface BackToDashboardProps {
  variant?: "button" | "floating"
}

export function BackToDashboard({ variant = "button" }: BackToDashboardProps) {
  const { user } = useAuth()

  if (!user) return null

  if (variant === "floating") {
    return (
      <Link href="/dashboard">
        <Button
          size="icon"
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
          aria-label="Go to Dashboard"
        >
          <Home className="h-6 w-6" />
        </Button>
      </Link>
    )
  }

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
  return <BackToDashboard variant="floating" />
}
