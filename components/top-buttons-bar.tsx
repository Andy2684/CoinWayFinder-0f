"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogIn, UserPlus, ArrowRight } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

export function TopButtonsBar() {
  const { user } = useAuth()

  if (user) {
    return null // Don't show the bar if user is already logged in
  }

  return (
    <div className="w-full bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-b border-white/10 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-4">
            <span className="text-white/90 text-sm font-medium">Start trading with AI-powered bots today</span>
            <div className="hidden sm:flex items-center text-white/70 text-xs">
              <span>✓ Free 14-day trial</span>
              <span className="mx-2">•</span>
              <span>✓ No credit card required</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10 border border-white/20 hover:border-white/30 transition-all duration-200"
            >
              <Link href="/auth/login" className="flex items-center">
                <LogIn className="w-4 h-4 mr-2" />
                Log In
              </Link>
            </Button>

            <Button
              asChild
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Link href="/auth/signup" className="flex items-center">
                <UserPlus className="w-4 h-4 mr-2" />
                Sign Up Free
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
