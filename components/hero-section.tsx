"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, TrendingUp, Shield, Zap, Users, DollarSign, Bot, BarChart3, Mail, CheckCircle } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

export function HeroSection() {
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)
  const { user } = useAuth()

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setIsSubscribed(true)
      setEmail("")
    }
  }

  const stats = [
    { icon: Users, value: "50K+", label: "Active Traders" },
    { icon: DollarSign, value: "$2.5B+", label: "Trading Volume" },
    { icon: Bot, value: "10K+", label: "AI Bots Running" },
    { icon: BarChart3, value: "94%", label: "Success Rate" },
  ]

  const features = [
    {
      icon: Bot,
      title: "AI-Powered Trading Bots",
      description: "Advanced algorithms that trade 24/7 with machine learning optimization",
    },
    {
      icon: Shield,
      title: "Bank-Grade Security",
      description: "Military-grade encryption and secure API connections to protect your assets",
    },
    {
      icon: Zap,
      title: "Lightning Fast Execution",
      description: "Execute trades in milliseconds with our high-performance infrastructure",
    },
    {
      icon: TrendingUp,
      title: "Real-Time Analytics",
      description: "Advanced market analysis and insights powered by AI and big data",
    },
  ]

  return (
    <section className="relative py-20 px-4 overflow-hidden text-center">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-gray-900/20" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

      <div className="container mx-auto relative z-10 max-w-4xl">
        {/* Main Hero Content */}
        <div className="space-y-6">
          <Badge className="mb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            🚀 New: Advanced AI Trading Algorithms Available
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
            Advanced Crypto Trading
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {" "}
              Made Simple
            </span>
          </h1>

          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Harness the power of AI-driven trading bots, real-time market signals, and comprehensive portfolio
            management to maximize your crypto investments.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            {user ? (
              <Button
                size="lg"
                asChild
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Link href="/dashboard">View Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button
                  size="lg"
                  asChild
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Link href="/auth/signup">
                    Start Trading Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                >
                  <Link href="/auth/login">Member Login</Link>
                </Button>
              </>
            )}
          </div>

          {/* Email Signup */}
          {!user && (
            <div className="max-w-md mx-auto mb-12">
              <form onSubmit={handleEmailSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="email"
                    placeholder="Enter your email to get started"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isSubscribed ? <CheckCircle className="h-4 w-4" /> : "Get Started"}
                </Button>
              </form>
              {isSubscribed && (
                <p className="text-green-400 text-sm mt-2 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Thanks! We'll be in touch soon.
                </p>
              )}
            </div>
          )}

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-8 text-gray-400 text-sm">
            <span>✓ No Credit Card Required</span>
            <span>✓ 7-Day Free Trial</span>
            <span>✓ Cancel Anytime</span>
            <span>✓ 24/7 Support</span>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-white/5 backdrop-blur-lg border-white/10">
                <CardContent className="p-6 text-center">
                  <stat.icon className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16">
            <div className="flex flex-col items-center space-y-4">
              <div className="p-3 rounded-full bg-blue-600/20">
                <Bot className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">AI Trading Bots</h3>
              <p className="text-gray-400 text-center">
                Automated trading strategies powered by advanced AI algorithms
              </p>
            </div>

            <div className="flex flex-col items-center space-y-4">
              <div className="p-3 rounded-full bg-purple-600/20">
                <TrendingUp className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Real-time Signals</h3>
              <p className="text-gray-400 text-center">Get instant market insights and trading opportunities</p>
            </div>

            <div className="flex flex-col items-center space-y-4">
              <div className="p-3 rounded-full bg-green-600/20">
                <Shield className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Secure & Reliable</h3>
              <p className="text-gray-400 text-center">Bank-grade security with 24/7 monitoring and support</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
