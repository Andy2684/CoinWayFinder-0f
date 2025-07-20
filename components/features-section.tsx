"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Bot,
  TrendingUp,
  Shield,
  Zap,
  BarChart3,
  Clock,
  Target,
  Brain,
  ArrowRight,
  UserPlus,
  LogIn,
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

export function FeaturesSection() {
  const { user } = useAuth()

  const features = [
    {
      icon: Bot,
      title: "AI-Powered Trading Bots",
      description:
        "Advanced machine learning algorithms that adapt to market conditions and execute trades 24/7 with precision.",
      benefits: ["Smart decision making", "Continuous learning", "Risk management"],
    },
    {
      icon: TrendingUp,
      title: "Real-Time Market Analysis",
      description:
        "Get instant insights with comprehensive market analysis, trend detection, and predictive analytics.",
      benefits: ["Live market data", "Trend predictions", "Technical indicators"],
    },
    {
      icon: Shield,
      title: "Advanced Security",
      description: "Bank-level encryption and security protocols to protect your funds and trading strategies.",
      benefits: ["256-bit encryption", "2FA authentication", "Cold storage"],
    },
    {
      icon: Zap,
      title: "Lightning Fast Execution",
      description:
        "Execute trades in milliseconds with our high-performance infrastructure and direct exchange connections.",
      benefits: ["Sub-second execution", "Low latency", "99.9% uptime"],
    },
    {
      icon: BarChart3,
      title: "Portfolio Analytics",
      description: "Comprehensive portfolio tracking with detailed performance metrics and risk analysis.",
      benefits: ["Performance tracking", "Risk metrics", "Profit/loss analysis"],
    },
    {
      icon: Brain,
      title: "Smart Strategy Builder",
      description: "Create custom trading strategies with our intuitive drag-and-drop interface and backtesting tools.",
      benefits: ["Visual strategy builder", "Backtesting", "Strategy optimization"],
    },
  ]

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/5 to-transparent" />

      <div className="relative max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-medium mb-6">
            <Zap className="w-4 h-4 mr-2" />
            Powerful Features
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Everything You Need to
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent block">
              Trade Like a Pro
            </span>
          </h2>

          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Our comprehensive suite of trading tools and AI-powered features gives you the edge you need to succeed in
            the fast-paced world of cryptocurrency trading.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group"
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white text-xl">{feature.title}</CardTitle>
                <CardDescription className="text-gray-300">{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {feature.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center text-gray-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-3" />
                      {benefit}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  variant="ghost"
                  className="w-full text-blue-400 hover:text-white hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/40"
                >
                  <Link href={user ? "/dashboard" : "/auth/signup"} className="flex items-center justify-center">
                    {user ? "Explore Feature" : "Get Started"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-6">Advanced AI That Never Sleeps</h3>
            <p className="text-gray-300 mb-6 text-lg">
              Our AI trading bots work around the clock, analyzing market conditions, identifying opportunities, and
              executing trades with precision. No emotions, no fatigue, just pure algorithmic excellence.
            </p>
            <div className="space-y-4 mb-8">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-blue-400 mr-3" />
                <span className="text-white">24/7 automated trading</span>
              </div>
              <div className="flex items-center">
                <Target className="w-5 h-5 text-green-400 mr-3" />
                <span className="text-white">Precision entry and exit points</span>
              </div>
              <div className="flex items-center">
                <BarChart3 className="w-5 h-5 text-purple-400 mr-3" />
                <span className="text-white">Real-time performance monitoring</span>
              </div>
            </div>
            {!user && (
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  asChild
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
                >
                  <Link href="/auth/signup" className="flex items-center">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Start Free Trial
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 bg-transparent"
                >
                  <Link href="/auth/login" className="flex items-center">
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Link>
                </Button>
              </div>
            )}
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 rounded-2xl p-8 border border-white/10 backdrop-blur-sm">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <span className="text-white">BTC/USDT Bot</span>
                  <span className="text-green-400 font-semibold">+12.5%</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <span className="text-white">ETH/USDT Bot</span>
                  <span className="text-green-400 font-semibold">+8.3%</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <span className="text-white">ADA/USDT Bot</span>
                  <span className="text-green-400 font-semibold">+15.7%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        {!user && (
          <div className="text-center bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-2xl p-8 border border-white/10">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Start Trading Smarter?</h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Join thousands of traders who are already using our AI-powered platform to maximize their profits.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8"
              >
                <Link href="/auth/signup" className="flex items-center">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Create Free Account
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 px-8 bg-transparent"
              >
                <Link href="/auth/login" className="flex items-center">
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
