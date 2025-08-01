"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bot, TrendingUp, Shield, Zap, Users, Globe } from "lucide-react"
import type { UserOnboardingData } from "@/types/onboarding"

interface WelcomeStepProps {
  data: UserOnboardingData | null
  onNext: (data?: Partial<UserOnboardingData>) => void
  onPrevious: () => void
  isLoading: boolean
}

export function WelcomeStep({ onNext, isLoading }: WelcomeStepProps) {
  const features = [
    {
      icon: Bot,
      title: "AI-Powered Trading Bots",
      description: "Automated trading strategies that work 24/7",
      badge: "Popular",
    },
    {
      icon: TrendingUp,
      title: "Advanced Analytics",
      description: "Real-time market data and performance tracking",
      badge: "Pro",
    },
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "Your funds and data are always protected",
      badge: "Secure",
    },
    {
      icon: Zap,
      title: "Lightning Fast Execution",
      description: "Execute trades in milliseconds across exchanges",
      badge: "Fast",
    },
    {
      icon: Users,
      title: "Community Signals",
      description: "Learn from experienced traders worldwide",
      badge: "Social",
    },
    {
      icon: Globe,
      title: "Multi-Exchange Support",
      description: "Connect to Binance, Coinbase, Kraken, and more",
      badge: "Global",
    },
  ]

  const stats = [
    { value: "50K+", label: "Active Traders" },
    { value: "$2.5B+", label: "Volume Traded" },
    { value: "99.9%", label: "Uptime" },
    { value: "24/7", label: "Support" },
  ]

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Bot className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white">Welcome to CoinWayFinder!</h2>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          The most advanced crypto trading platform designed for both beginners and professionals
        </p>
        <div className="flex justify-center space-x-2">
          <Badge className="bg-green-500/20 text-green-400 border-green-500/20">🚀 Get Started in 5 Minutes</Badge>
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/20">🎁 Free 30-Day Trial</Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-slate-700/50 border-slate-600 text-center">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Features Grid */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white text-center">What You'll Get Access To</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <Card key={index} className="bg-slate-700/50 border-slate-600 hover:border-blue-500/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-white">{feature.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {feature.badge}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center space-y-4">
        <p className="text-gray-300">
          Ready to transform your crypto trading experience? Let's set up your account in just a few steps.
        </p>
        <div className="flex justify-center space-x-4">
          <Button
            onClick={() => onNext()}
            disabled={isLoading}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 px-8"
          >
            {isLoading ? "Starting..." : "Let's Get Started! 🚀"}
          </Button>
        </div>
        <p className="text-sm text-gray-500">This will take about 5 minutes and you'll earn rewards along the way!</p>
      </div>
    </div>
  )
}
