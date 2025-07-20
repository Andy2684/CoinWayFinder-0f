"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { X, LogIn, UserPlus, Sparkles } from "lucide-react"
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
        <div className="flex items-center gap-2 text-sm">
          <Sparkles className="h-4 w-4" />
          <span className="font-medium">Start Trading Free Today!</span>
          <span className="hidden sm:inline">• No Credit Card Required • 7-Day Free Trial</span>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="text-white hover:bg-white/20 h-8">
            <Link href="/auth/login">
              <LogIn className="h-4 w-4 mr-1" />
              Log In
            </Link>
          </Button>

          <Button asChild size="sm" className="bg-white text-blue-600 hover:bg-gray-100 h-8">
            <Link href="/auth/signup">
              <UserPlus className="h-4 w-4 mr-1" />
              Sign Up Free
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="text-white hover:bg-white/20 h-8 w-8 p-0 ml-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
