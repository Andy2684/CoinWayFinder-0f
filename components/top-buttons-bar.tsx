"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { X, LogIn, UserPlus } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

export function TopButtonsBar() {
  const [isVisible, setIsVisible] = useState(true)
  const { user } = useAuth()

  // Don't show the bar if user is logged in or if dismissed
  if (!isVisible || user) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 relative">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">
            🚀 Start trading crypto with AI-powered bots • Free trial • No credit card required
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <Link href="/auth/login">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 text-xs">
              <LogIn className="w-3 h-3 mr-1" />
              Log In
            </Button>
          </Link>

          <Link href="/auth/signup">
            <Button
              variant="secondary"
              size="sm"
              className="bg-white text-blue-600 hover:bg-gray-100 text-xs font-semibold"
            >
              <UserPlus className="w-3 h-3 mr-1" />
              Sign Up Free
            </Button>
          </Link>

          <button
            onClick={() => setIsVisible(false)}
            className="text-white hover:bg-white/20 p-1 rounded"
            aria-label="Close banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
