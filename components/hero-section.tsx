"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Bot, TrendingUp, Zap, Shield } from "lucide-react"

export function HeroSection() {
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    setMounted(true)
    // Check for user in localStorage after mount
    const userData = localStorage.getItem("user_data")
    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error("Error parsing user data:", error)
      }
    }
  }, [])

  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          {/* Main Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              AI-Powered
            </span>
            <br />
            Crypto Trading
          </h1>

          {/* Subheading */}
          <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Automate your cryptocurrency trading with advanced AI algorithms, real-time market analysis, and
            professional-grade tools.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white">
              <Bot className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium">AI Trading Bots</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium">Real-time Analytics</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium">Lightning Fast</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white">
              <Shield className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium">Bank-Grade Security</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {mounted && user ? (
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/signup">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
                  >
                    Start Trading Now
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold rounded-xl backdrop-blur-sm transition-all duration-300 bg-transparent"
                  >
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">$2.5B+</div>
              <div className="text-gray-400">Trading Volume</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">50K+</div>
              <div className="text-gray-400">Active Traders</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">99.9%</div>
              <div className="text-gray-400">Uptime</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
