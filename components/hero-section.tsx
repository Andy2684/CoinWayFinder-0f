"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Bot, TrendingUp, Zap, Shield, BarChart3, Target } from "lucide-react"
import Link from "next/link"

const floatingIcons = [
  { Icon: Bot, delay: 0, position: "top-20 left-20" },
  { Icon: TrendingUp, delay: 1000, position: "top-32 right-32" },
  { Icon: Zap, delay: 2000, position: "bottom-40 left-16" },
  { Icon: Shield, delay: 3000, position: "bottom-20 right-20" },
  { Icon: BarChart3, delay: 4000, position: "top-1/2 left-8" },
  { Icon: Target, delay: 5000, position: "top-1/3 right-8" },
]

export function HeroSection() {
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
    // Check for user data in localStorage after mount
    try {
      const userData = localStorage.getItem("user_data")
      if (userData) {
        setUser(JSON.parse(userData))
      }
    } catch (error) {
      console.error("Error loading user data:", error)
    }
    setLoading(false)
  }, [])

  if (!mounted) {
    return (
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded mb-6 mx-auto w-64"></div>
            <div className="h-16 bg-gray-700 rounded mb-6 mx-auto"></div>
            <div className="h-6 bg-gray-700 rounded mb-8 mx-auto w-96"></div>
            <div className="flex justify-center space-x-4">
              <div className="h-12 w-40 bg-gray-700 rounded"></div>
              <div className="h-12 w-32 bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden">
      {/* Floating Icons */}
      {floatingIcons.map(({ Icon, delay, position }, index) => (
        <div
          key={index}
          className={`absolute ${position} opacity-20 animate-bounce hidden lg:block`}
          style={{ animationDelay: `${delay}ms`, animationDuration: "3s" }}
        >
          <Icon className="w-8 h-8 text-blue-400" />
        </div>
      ))}

      <div className="max-w-6xl mx-auto text-center relative z-10">
        {/* Badge */}
        <Badge variant="secondary" className="mb-6 bg-blue-500/20 text-blue-300 border-blue-500/30 px-4 py-2">
          <Zap className="w-4 h-4 mr-2" />
          AI-Powered Trading Platform
        </Badge>

        {/* Main Heading */}
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          Trade Smarter with
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent block mt-2">
            AI Trading Bots
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
          Maximize your crypto profits with intelligent automation. Our AI-powered bots trade 24/7, analyzing market
          patterns and executing optimal strategies while you sleep.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-2xl mx-auto">
          <div className="bg-white/5 backdrop-blur-xl rounded-lg p-4 border border-white/10">
            <div className="text-2xl font-bold text-blue-400">98.7%</div>
            <div className="text-sm text-gray-400">Success Rate</div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-lg p-4 border border-white/10">
            <div className="text-2xl font-bold text-green-400">$2.4M+</div>
            <div className="text-sm text-gray-400">Total Profits</div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-lg p-4 border border-white/10">
            <div className="text-2xl font-bold text-purple-400">10K+</div>
            <div className="text-sm text-gray-400">Active Users</div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {loading ? (
            <>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg" disabled>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Loading...
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg bg-transparent"
                disabled
              >
                Loading...
              </Button>
            </>
          ) : user ? (
            <>
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">
                <Link href="/dashboard">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg bg-transparent"
              >
                <Link href="/bots">
                  <Bot className="w-5 h-5 mr-2" />
                  Manage Bots
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">
                <Link href="/auth/signup">
                  Start Trading Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg bg-transparent"
              >
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </>
          )}
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 text-sm mb-4">Trusted by traders worldwide</p>
          <div className="flex justify-center items-center space-x-8 opacity-60">
            <div className="text-white font-semibold">Binance</div>
            <div className="text-white font-semibold">Coinbase</div>
            <div className="text-white font-semibold">Kraken</div>
            <div className="text-white font-semibold">KuCoin</div>
          </div>
        </div>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent pointer-events-none" />
    </section>
  )
}
