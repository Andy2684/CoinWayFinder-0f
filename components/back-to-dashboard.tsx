"use client"

import { ArrowLeft, LayoutDashboard } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"

export function BackToDashboard() {
  return (
    <div className="fixed top-4 left-4 z-50">
      <Link href="/dashboard">
        <Button
          variant="outline"
          size="sm"
          className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
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
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 rounded-full px-6 py-3"
        >
          <LayoutDashboard className="w-5 h-5 mr-2" />
          Dashboard
        </Button>
      </Link>
    </div>
  )
}
