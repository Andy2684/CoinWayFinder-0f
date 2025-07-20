"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, LayoutDashboard } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export function BackToDashboard() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <div className="fixed top-20 left-4 z-40">
      <Link href="/dashboard">
        <Button
          variant="outline"
          size="sm"
          className="bg-black/20 backdrop-blur-md border-white/20 text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </Link>
    </div>
  )
}

export function FloatingDashboardButton() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Link href="/dashboard">
        <Button
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <LayoutDashboard className="h-5 w-5 mr-2" />
          Dashboard
        </Button>
      </Link>
    </div>
  )
}
