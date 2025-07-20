"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, TrendingUp, Shield, Zap } from "lucide-react"

export function HeroSection() {
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    setMounted(true)
    // Check for user in localStorage after mount
    const userData = localStorage.getItem("user")
    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error("Error parsing user data:", error)
      }
    }
  }, [])

  if (!mounted) {
    return (
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="h-16 bg-gray-700/50 rounded animate-pulse mb-6 mx-auto max-w-4xl"></div>
            <div className="h-6 bg-gray-700/50 rounded animate-pulse mb-8 mx-auto max-w-2xl"></div>
            <div className="flex justify-center space-x-4">
              <div className="w-32 h-12 bg-gray-700/50 rounded animate-pulse"></div>
              <div className="w-32 h-12 bg-gray-700/50 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">
            <TrendingUp className="w-4 h-4 mr-2" />
            Advanced Crypto Trading Platform
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Trade Smarter with
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              AI-Powered Bots
            </span>
          </h1>

          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Maximize your crypto profits with our advanced trading algorithms, real-time market analysis, and automated
            strategies. Join thousands of successful traders today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            {user ? (
              <Link href="/dashboard">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/signup">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">
                    Start Trading Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-4 text-lg bg-transparent"
                  >
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-3 text-gray-300">
              <Shield className="h-6 w-6 text-green-400" />
              <span>Bank-Grade Security</span>
            </div>
            <div className="flex items-center justify-center space-x-3 text-gray-300">
              <Zap className="h-6 w-6 text-yellow-400" />
              <span>Lightning Fast Execution</span>
            </div>
            <div className="flex items-center justify-center space-x-3 text-gray-300">
              <TrendingUp className="h-6 w-6 text-blue-400" />
              <span>AI-Powered Analytics</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
