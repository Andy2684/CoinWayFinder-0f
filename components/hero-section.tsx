"use client"

import React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, TrendingUp, Bot, Shield, Zap } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

export function HeroSection() {
  const { user } = useAuth()
  const [currentStat, setCurrentStat] = useState(0)

  const stats = [
    { label: "Active Traders", value: "50K+", icon: TrendingUp },
    { label: "AI Bots Running", value: "12K+", icon: Bot },
    { label: "Success Rate", value: "94%", icon: Shield },
    { label: "Trades/Day", value: "1M+", icon: Zap },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [stats.length])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920')] opacity-10"></div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-purple-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-green-500/20 rounded-full blur-xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-40 right-10 w-16 h-16 bg-yellow-500/20 rounded-full blur-xl animate-pulse delay-3000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight">
              Trade Smarter with
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {" "}
                AI-Powered
              </span>
              <br />
              Crypto Bots
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Automate your crypto trading with advanced AI algorithms. Join thousands of traders maximizing profits
              24/7.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {user ? (
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 text-lg"
              >
                <Link href="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            ) : (
              <>
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 text-lg"
                >
                  <Link href="/auth/signup">
                    Start Trading Now
                    <ArrowRight className="ml-2 w-5 h-5" />
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

          {/* Rotating Stats */}
          <div className="mt-12">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 max-w-md mx-auto border border-white/20">
              <div className="flex items-center justify-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
                  {React.createElement(stats[currentStat].icon, { className: "w-6 h-6 text-white" })}
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold text-white">{stats[currentStat].value}</div>
                  <div className="text-gray-300">{stats[currentStat].label}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-white">99.9%</div>
              <div className="text-gray-400">Uptime</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-white">$2.5B+</div>
              <div className="text-gray-400">Volume Traded</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-white">150+</div>
              <div className="text-gray-400">Countries</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-white">24/7</div>
              <div className="text-gray-400">Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
