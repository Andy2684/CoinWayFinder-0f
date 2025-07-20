"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Home } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { cn } from "@/lib/utils"

interface BackToDashboardProps {
  className?: string
  variant?: "default" | "outline" | "ghost"
  size?: "sm" | "default" | "lg"
  showIcon?: boolean
  text?: string
}

export function BackToDashboard({
  className,
  variant = "outline",
  size = "default",
  showIcon = true,
  text = "Back to Dashboard",
}: BackToDashboardProps) {
  const router = useRouter()
  const { user } = useAuth()

  // Only show if user is authenticated
  if (!user) {
    return null
  }

  const handleClick = () => {
    router.push("/dashboard")
  }

  return (
    <Button
      onClick={handleClick}
      variant={variant}
      size={size}
      className={cn(
        "transition-all duration-200 hover:scale-105",
        variant === "outline" && "border-white/20 text-white hover:bg-white/10",
        className,
      )}
    >
      {showIcon && <ArrowLeft className="h-4 w-4 mr-2" />}
      {text}
    </Button>
  )
}

export function FloatingDashboardButton() {
  const router = useRouter()
  const { user } = useAuth()

  // Only show if user is authenticated
  if (!user) {
    return null
  }

  const handleClick = () => {
    router.push("/dashboard")
  }

  return (
    <Button
      onClick={handleClick}
      className={cn(
        "fixed bottom-6 right-6 z-50 rounded-full shadow-lg hover:shadow-xl",
        "transition-all duration-300 hover:scale-110 active:scale-95",
        "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
        "text-white border-0 h-14 w-14 p-0",
        "group",
      )}
      size="lg"
    >
      <Home className="h-6 w-6 transition-transform group-hover:scale-110" />
      <span className="sr-only">Go to Dashboard</span>
    </Button>
  )
}
