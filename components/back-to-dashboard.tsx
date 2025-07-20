"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Home } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

interface BackToDashboardProps {
  className?: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
  showIcon?: boolean
  text?: string
}

export function BackToDashboard({
  className = "",
  variant = "outline",
  size = "sm",
  showIcon = true,
  text = "Back to Dashboard",
}: BackToDashboardProps) {
  const router = useRouter()
  const { user } = useAuth()

  // Don't show if user is not logged in
  if (!user) {
    return null
  }

  const handleBackToDashboard = () => {
    router.push("/dashboard")
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleBackToDashboard}
      className={`${className} transition-all duration-200 hover:scale-105`}
    >
      {showIcon && <ArrowLeft className="h-4 w-4 mr-2" />}
      {text}
    </Button>
  )
}

export function BackToDashboardFloating() {
  const router = useRouter()
  const { user } = useAuth()

  // Don't show if user is not logged in
  if (!user) {
    return null
  }

  const handleBackToDashboard = () => {
    router.push("/dashboard")
  }

  return (
    <Button
      onClick={handleBackToDashboard}
      className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
      size="lg"
    >
      <Home className="h-5 w-5 mr-2" />
      Dashboard
    </Button>
  )
}
