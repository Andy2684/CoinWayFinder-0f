"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Bot,
  Shield,
  BarChart3,
  Zap,
  TrendingUp,
  Users,
  Clock,
  Target,
  ArrowRight,
  CheckCircle,
  UserPlus,
  LogIn,
  Play,
  Star,
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

export function FeaturesSection() {
  const { user } = useAuth()
  const [activeFeature, setActiveFeature] = useState(0)

  const features = [
    {
      icon: Bot,
      title: "AI-Powered Trading Bots",
      description: "Advanced machine learning algorithms that adapt to market conditions and execute trades 24/7.",
      benefits: ["Automated trading", "Risk management", "Portfolio optimization", "Real-time analysis"],
      color: "blue",
    },
    {
      icon: Shield,
      title: "Bank-Grade Security",
      description: "Your funds and data are protected with military-grade encryption and multi-layer security.",
      benefits: ["256-bit encryption", "Cold storage", "2FA authentication", "Insurance coverage"],
      color: "green",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Comprehensive market analysis tools with real-time data and predictive insights.",
      benefits: ["Real-time charts", "Technical indicators", "Market sentiment", "Price predictions"],
      color: "purple",
    },
    {
      icon: Zap,
      title: "Lightning Fast Execution",
      description: "Ultra-low latency trading infrastructure ensures you never miss profitable opportunities.",
      benefits: ["Sub-millisecond execution", "Direct exchange access", "Smart routing", "Minimal slippage"],
      color: "yellow",
    },
  ]

  const stats = [
    { icon: TrendingUp, value: "94.2%", label: "Success Rate", color: "text-green-400" },
    { icon: Users, value: "50K+", label: "Active Users", color: "text-blue-400" },
    { icon: Clock, value: "24/7", label: "Trading Hours", color: "text-purple-400" },
    { icon: Target, value: "1M+", label: "Trades/Day", color: "text-yellow-400" },
  ]

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
      green: "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
      purple: "from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
      yellow: "from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700",
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.blue
  }

  return (
    <section id="features" className="py-24 bg-gradient-to-b from-slate-900 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 mb-4">
            <Star className="w-4 h-4 mr-2" />
            Premium Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Everything You Need to
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent block">
              Dominate the Markets
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Our comprehensive suite of tools and features gives you the edge you need to succeed in crypto trading.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card
                key={index}
                className="bg-white/5 backdrop-blur-lg border-white/10 hover:bg-white/10 transition-all duration-300"
              >
                <CardContent className="p-6 text-center">
                  <Icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon
            const colorClasses = getColorClasses(feature.color)
            return (
              <Card
                key={index}
                className="bg-white/5 backdrop-blur-lg border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 cursor-pointer group"
                onMouseEnter={() => setActiveFeature(index)}
              >
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-3 rounded-lg bg-gradient-to-r ${colorClasses} group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-white">{feature.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-6">{feature.description}</p>
                  <div className="space-y-3 mb-6">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <div key={benefitIndex} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span className="text-gray-300">{benefit}</span>
                      </div>
                    ))}
                  </div>
                  {!user && (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button asChild className={`bg-gradient-to-r ${colorClasses} text-white font-semibold flex-1`}>
                        <Link href="/auth/signup">
                          <UserPlus className="w-4 h-4 mr-2" />
                          Get Started
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10 bg-transparent flex-1"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Demo
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* CTA Section */}
        {!user && (
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <h3 className="text-3xl font-bold text-white mb-4">Ready to Experience These Features?</h3>
              <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                Join thousands of successful traders who are already using our platform to maximize their profits.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4"
                >
                  <Link href="/auth/signup">
                    <UserPlus className="mr-2 h-5 w-5" />
                    Create Free Account
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10 px-8 py-4 bg-transparent"
                >
                  <Link href="/auth/login">
                    <LogIn className="mr-2 h-5 w-5" />
                    Sign In to Account
                  </Link>
                </Button>
              </div>
              <p className="text-sm text-gray-400 mt-4">No credit card required • Free forever plan available</p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
