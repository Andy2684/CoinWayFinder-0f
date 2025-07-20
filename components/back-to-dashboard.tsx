"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Home } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth/auth-provider"

interface BackToDashboardProps {
  variant?: "default" | "floating"
}

export function BackToDashboard({ variant = "default" }: BackToDashboardProps) {
  const { user } = useAuth()

  if (!user) {
    return null
  }

  if (variant === "floating") {
    return <FloatingDashboardButton />
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
  const { user } = useAuth()

  if (!user) {
    return null
  }

  return (
    <Link href="/dashboard">
      <Button
        size="lg"
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 p-0 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
        aria-label="Go to Dashboard"
      >
        <Home className="h-6 w-6" />
      </Button>
    </Link>
  )
}

export default BackToDashboard
