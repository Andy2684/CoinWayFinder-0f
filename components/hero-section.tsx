"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Bot, Zap, Shield, BarChart3, Users, ArrowRight, Play } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"

export function HeroSection() {
  const { user, loading } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-pulse">
            <div className="h-16 bg-gray-700 rounded mb-6 mx-auto max-w-4xl"></div>
            <div className="h-6 bg-gray-700 rounded mb-8 mx-auto max-w-2xl"></div>
            <div className="flex justify-center space-x-4">
              <div className="h-12 w-32 bg-gray-700 rounded"></div>
              <div className="h-12 w-32 bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />

      {/* Floating Background Icons */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 opacity-10">
          <TrendingUp className="h-24 w-24 text-blue-400 animate-pulse" />
        </div>
        <div className="absolute top-40 right-20 opacity-10">
          <Bot className="h-32 w-32 text-purple-400 animate-bounce" />
        </div>
        <div className="absolute bottom-40 left-20 opacity-10">
          <BarChart3 className="h-28 w-28 text-green-400 animate-pulse" />
        </div>
        <div className="absolute bottom-20 right-10 opacity-10">
          <Shield className="h-20 w-20 text-yellow-400 animate-bounce" />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
        {/* Badge */}
        <Badge className="mb-6 bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30 transition-colors">
          <Zap className="h-3 w-3 mr-1" />
          AI-Powered Trading Platform
        </Badge>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
          Trade Smarter with
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent block">
            AI-Powered Bots
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
          Automate your cryptocurrency trading with advanced AI algorithms, real-time market analysis, and
          professional-grade tools.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          {loading ? (
            <>
              <div className="h-12 w-40 bg-gray-700 rounded animate-pulse"></div>
              <div className="h-12 w-32 bg-gray-700 rounded animate-pulse"></div>
            </>
          ) : user ? (
            <>
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg"
                >
                  <ArrowRight className="h-5 w-5 mr-2" />
                  Go to Dashboard
                </Button>
              </Link>
              <Link href="/bots">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 px-8 py-3 text-lg bg-transparent"
                >
                  <Bot className="h-5 w-5 mr-2" />
                  Manage Bots
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg"
                >
                  <ArrowRight className="h-5 w-5 mr-2" />
                  Start Trading Free
                </Button>
              </Link>
              <Link href="#demo">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 px-8 py-3 text-lg bg-transparent"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Watch Demo
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">$2.5M+</div>
            <div className="text-gray-400">Total Volume Traded</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">10,000+</div>
            <div className="text-gray-400">Active Traders</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">99.9%</div>
            <div className="text-gray-400">Uptime Guarantee</div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 flex flex-wrap justify-center items-center gap-8 opacity-60">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-green-400" />
            <span className="text-gray-300">Bank-Grade Security</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-400" />
            <span className="text-gray-300">24/7 Support</span>
          </div>
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            <span className="text-gray-300">Lightning Fast</span>
          </div>
        </div>
      </div>
    </section>
  )
}
