"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowRight,
  Play,
  TrendingUp,
  Shield,
  Zap,
  Users,
  Star,
  ChevronDown,
  Bot,
  BarChart3,
  Coins,
  Activity,
  Target,
  Rocket,
  Award,
  Globe,
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

export function HeroSection() {
  const { user } = useAuth()
  const [currentStat, setCurrentStat] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  const stats = [
    { label: "Active Traders", value: "50,000+", icon: Users },
    { label: "Total Volume", value: "$2.5B+", icon: TrendingUp },
    { label: "Success Rate", value: "94.2%", icon: Target },
    { label: "AI Bots Running", value: "12,500+", icon: Bot },
  ]

  const features = [
    { icon: Bot, label: "AI Trading Bots", desc: "Automated 24/7 trading" },
    { icon: Shield, label: "Secure Platform", desc: "Bank-grade security" },
    { icon: BarChart3, label: "Advanced Analytics", desc: "Real-time insights" },
    { icon: Zap, label: "Lightning Fast", desc: "Instant execution" },
  ]

  useEffect(() => {
    setIsVisible(true)
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-spin-slow" />
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          >
            <div className="w-2 h-2 bg-white/20 rounded-full blur-sm" />
          </div>
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div
          className={`mb-8 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <Badge className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border-white/20 px-4 py-2 text-sm font-medium">
            <Rocket className="w-4 h-4 mr-2" />
            #1 AI Trading Platform 2024
            <Award className="w-4 h-4 ml-2" />
          </Badge>
        </div>

        {/* Main Heading */}
        <div
          className={`mb-8 transition-all duration-1000 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Trade Smarter with
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent block">
              AI-Powered Bots
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Join thousands of traders using our advanced AI algorithms to maximize profits and minimize risks in the
            crypto market.
          </p>
        </div>

        {/* CTA Buttons */}
        <div
          className={`mb-12 transition-all duration-1000 delay-400 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {!user ? (
              <>
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 text-lg shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105"
                >
                  <Link href="/auth/signup">
                    Start Trading Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg backdrop-blur-sm bg-transparent"
                >
                  <Link href="/auth/login">
                    Sign In
                    <ChevronDown className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold px-8 py-4 text-lg shadow-2xl hover:shadow-green-500/25 transition-all duration-300 hover:scale-105"
                >
                  <Link href="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg backdrop-blur-sm bg-transparent"
                >
                  <Link href="/bots">
                    Create Bot
                    <Bot className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </>
            )}
            <Button variant="ghost" size="lg" className="text-white hover:bg-white/10 px-8 py-4 text-lg">
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Additional Action Buttons */}
        <div
          className={`mb-12 transition-all duration-1000 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <div className="flex flex-wrap gap-3 justify-center">
            <Button variant="secondary" size="sm" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
              <Globe className="w-4 h-4 mr-2" />
              Live Markets
            </Button>
            <Button variant="secondary" size="sm" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
              <Activity className="w-4 h-4 mr-2" />
              Trading Signals
            </Button>
            <Button variant="secondary" size="sm" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
              <BarChart3 className="w-4 h-4 mr-2" />
              Market Analysis
            </Button>
            <Button variant="secondary" size="sm" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
              <Coins className="w-4 h-4 mr-2" />
              Portfolio Tracker
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div
          className={`mb-16 transition-all duration-1000 delay-600 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div
                  key={index}
                  className={`text-center transition-all duration-500 ${
                    currentStat === index ? "scale-110 text-blue-400" : "text-white"
                  }`}
                >
                  <Icon className="w-8 h-8 mx-auto mb-2" />
                  <div className="text-2xl md:text-3xl font-bold">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Feature Cards */}
        <div
          className={`transition-all duration-1000 delay-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card
                  key={index}
                  className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20 cursor-pointer group"
                >
                  <CardContent className="p-6 text-center">
                    <Icon className="w-12 h-12 mx-auto mb-4 text-blue-400 group-hover:text-purple-400 transition-colors" />
                    <h3 className="text-lg font-semibold text-white mb-2">{feature.label}</h3>
                    <p className="text-gray-400 text-sm">{feature.desc}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-4 text-blue-400 hover:text-white hover:bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                      Learn More
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Trust Indicators */}
        <div
          className={`mt-16 transition-all duration-1000 delay-800 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="text-white text-sm">SSL Secured</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="text-white text-sm">4.9/5 Rating</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-400" />
              <span className="text-white text-sm">50K+ Users</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-purple-400" />
              <span className="text-white text-sm">Award Winning</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <ChevronDown className="w-6 h-6 text-white/60" />
      </div>
    </section>
  )
}
