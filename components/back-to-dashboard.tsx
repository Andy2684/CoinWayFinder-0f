"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, LayoutDashboard } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { cn } from "@/lib/utils"

interface BackToDashboardProps {
  className?: string
  variant?: "default" | "outline" | "ghost" | "floating"
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

  if (variant === "floating") {
    return (
      <Button
        onClick={handleClick}
        className={cn(
          "fixed bottom-6 right-6 z-50 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105",
          "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
          className,
        )}
        size={size}
      >
        {showIcon && <LayoutDashboard className="h-4 w-4 mr-2" />}
        Dashboard
      </Button>
    )
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
