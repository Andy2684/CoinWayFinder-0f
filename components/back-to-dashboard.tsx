"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Home } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"

export function BackToDashboard() {
  return (
    <Link href="/dashboard">
      <Button variant="outline" size="sm" className="mb-4 bg-transparent">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>
    </Link>
  )
}

export function FloatingDashboardButton() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <Link href="/dashboard">
      <Button
        size="lg"
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
      >
        <Home className="h-5 w-5 mr-2" />
        Dashboard
      </Button>
    </Link>
  )
}
