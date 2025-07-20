"use client"

import { Button } from "@/components/ui/button"
import { LogIn, UserPlus } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"

export function TopButtonsBar() {
  const { user } = useAuth()

  // Don't show the bar if user is already logged in
  if (user) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white py-2 px-4 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">🚀 Start trading crypto with AI-powered bots</span>
          <span className="hidden md:inline text-xs opacity-90">Free trial • No credit card required</span>
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
        </div>
      </div>
    </div>
  )
}
