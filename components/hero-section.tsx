"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, TrendingUp, Bot, Shield, Zap, Star, Users, BarChart3, Sparkles } from "lucide-react"

export function HeroSection() {
  const [currentStat, setCurrentStat] = useState(0)

  const stats = [
    { label: "Active Traders", value: "50,000+", icon: Users },
    { label: "Trading Volume", value: "$2.5B+", icon: BarChart3 },
    { label: "Success Rate", value: "94.2%", icon: TrendingUp },
    { label: "AI Bots Deployed", value: "125,000+", icon: Bot },
  ]

  const features = [
    {
      icon: Bot,
      title: "AI-Powered Trading Bots",
      description: "Deploy intelligent bots that trade 24/7 with advanced machine learning algorithms",
    },
    {
      icon: TrendingUp,
      title: "Real-Time Market Analysis",
      description: "Get instant insights with our advanced analytics and market prediction tools",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level security with multi-layer encryption and cold storage protection",
    },
    {
      icon: Zap,
      title: "Lightning Fast Execution",
      description: "Execute trades in milliseconds with our high-performance trading infrastructure",
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [stats.length])

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* New Dynamic Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-2000" />

        {/* Animated Lines */}
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/20 to-transparent animate-pulse" />
          <div className="absolute top-2/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400/20 to-transparent animate-pulse delay-1000" />
        </div>

        {/* Sparkle Effects */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          {/* Header Badge */}
          <div className="text-center mb-8">
            <Badge variant="secondary" className="bg-blue-500/10 text-blue-300 border-blue-500/20 px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              #1 AI-Powered Crypto Trading Platform
            </Badge>
          </div>

          {/* Main Hero Content */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent leading-tight">
              Trade Smarter with
              <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                AI-Powered Bots
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Harness the power of artificial intelligence to automate your crypto trading. Deploy advanced bots,
              analyze markets in real-time, and maximize your profits 24/7.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-2xl hover:shadow-blue-500/25 transition-all duration-300"
              >
                <Link href="/auth/signup" className="flex items-center">
                  Start Trading Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                asChild
                className="border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold backdrop-blur-sm bg-transparent"
              >
                <Link href="/features">Explore Features</Link>
              </Button>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
              {stats.map((stat, index) => (
                <Card
                  key={index}
                  className={`bg-white/5 border-white/10 backdrop-blur-sm transition-all duration-500 ${
                    currentStat === index ? "bg-white/10 border-blue-400/30 shadow-lg shadow-blue-500/10" : ""
                  }`}
                >
                  <CardContent className="p-6 text-center">
                    <stat.icon
                      className={`w-8 h-8 mx-auto mb-3 transition-colors duration-500 ${
                        currentStat === index ? "text-blue-400" : "text-gray-400"
                      }`}
                    />
                    <div
                      className={`text-2xl font-bold mb-1 transition-colors duration-500 ${
                        currentStat === index ? "text-white" : "text-gray-200"
                      }`}
                    >
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
              >
                <CardContent className="p-6">
                  <feature.icon className="w-12 h-12 text-blue-400 mb-4 group-hover:text-blue-300 transition-colors" />
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Trust Indicators */}
          <div className="text-center mt-16">
            <p className="text-gray-400 mb-6">Trusted by traders worldwide</p>
            <div className="flex items-center justify-center space-x-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
              ))}
              <span className="text-white ml-2 font-semibold">4.9/5</span>
              <span className="text-gray-400 ml-2">(12,847 reviews)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
