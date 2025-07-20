"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Home } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface BackToDashboardProps {
  className?: string
}

export function BackToDashboard({ className }: BackToDashboardProps) {
  return (
    <Link href="/dashboard">
      <Button
        variant="outline"
        size="sm"
        className={cn("border-white/10 text-white hover:bg-white/10 bg-transparent backdrop-blur-sm", className)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>
    </Link>
  )
}

export function FloatingDashboardButton() {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Link href="/dashboard">
        <Button
          size="lg"
          className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
        >
          <Home className="h-5 w-5 mr-2" />
          Dashboard
        </Button>
      </Link>
    </div>
  )
}
