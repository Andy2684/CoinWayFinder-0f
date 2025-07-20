"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Home } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

interface BackToDashboardProps {
  variant?: "default" | "floating"
}

export function BackToDashboard({ variant = "default" }: BackToDashboardProps) {
  const { user } = useAuth()

  if (!user) return null

  if (variant === "floating") {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          asChild
          size="lg"
          className="rounded-full w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
        >
          <Link href="/dashboard" aria-label="Go to Dashboard">
            <Home className="h-6 w-6" />
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <Button asChild variant="outline" className="mb-6 bg-transparent">
      <Link href="/dashboard">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Link>
    </Button>
  )
}

export function FloatingDashboardButton() {
  return <BackToDashboard variant="floating" />
}
