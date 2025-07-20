"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogIn, UserPlus, X } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { useState } from "react"

export function TopButtonsBar() {
  const { user } = useAuth()
  const [isVisible, setIsVisible] = useState(true)

  // Don't show the bar if user is logged in or if dismissed
  if (!isVisible || user) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-white py-2 px-4 relative">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">
            🚀 Start trading crypto with AI-powered bots • Free trial • No credit card required
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <Link href="/auth/login">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 border border-white/30">
              <LogIn className="w-4 h-4 mr-2" />
              Log In
            </Button>
          </Link>

          <Link href="/auth/signup">
            <Button size="sm" className="bg-white text-blue-600 hover:bg-gray-100 font-semibold">
              <UserPlus className="w-4 h-4 mr-2" />
              Sign Up Free
            </Button>
          </Link>

          <button
            onClick={() => setIsVisible(false)}
            className="text-white/70 hover:text-white ml-2"
            aria-label="Close banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
