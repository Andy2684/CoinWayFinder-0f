"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  TrendingUp,
  Shield,
  Zap,
  Users,
  DollarSign,
  Bot,
  BarChart3,
  UserPlus,
  LogIn,
  Mail,
  CheckCircle,
} from "lucide-react"
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
    <section className="relative py-20 px-4 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-gray-900/20" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

      <div className="container mx-auto relative z-10">
        {/* Main Hero Content */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <Badge className="mb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            🚀 New: Advanced AI Trading Algorithms Available
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Trade Crypto with
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {" "}
              AI Precision
            </span>
          </h1>

          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Harness the power of artificial intelligence to maximize your cryptocurrency trading profits. Our advanced
            bots work 24/7 to identify opportunities and execute trades with precision.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            {user ? (
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6"
              >
                <Link href="/dashboard">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <>
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6"
                >
                  <Link href="/auth/signup">
                    <UserPlus className="mr-2 h-5 w-5" />
                    Start Trading Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="text-white border-white/20 hover:bg-white/10 text-lg px-8 py-6 bg-transparent"
                >
                  <Link href="/auth/login">
                    <LogIn className="mr-2 h-5 w-5" />
                    Sign In
                  </Link>
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
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-white/5 backdrop-blur-lg border-white/10 hover:bg-white/10 transition-colors"
            >
              <CardContent className="p-6">
                <feature.icon className="h-10 w-10 text-blue-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        {!user && (
          <div className="text-center bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-2xl p-8 backdrop-blur-lg border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-4">Ready to Start Your Trading Journey?</h2>
            <p className="text-gray-300 mb-6">
              Join thousands of traders who are already using AI to maximize their profits
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Link href="/auth/signup">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Create Free Account
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="text-white border-white/20 hover:bg-white/10 bg-transparent"
              >
                <Link href="/auth/login">
                  <LogIn className="mr-2 h-5 w-5" />
                  Member Login
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
