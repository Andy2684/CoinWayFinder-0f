"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bot, TrendingUp, Shield, Zap, BarChart3, Bell, Wallet, Users, Brain, Target, Clock, Award } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: Bot,
      title: "AI Trading Bots",
      description:
        "Advanced machine learning algorithms that adapt to market conditions and execute trades automatically.",
      badge: "Popular",
      color: "text-blue-400",
    },
    {
      icon: Brain,
      title: "Neural Networks",
      description:
        "Deep learning models trained on years of market data to predict price movements with high accuracy.",
      badge: "Advanced",
      color: "text-purple-400",
    },
    {
      icon: TrendingUp,
      title: "Market Analysis",
      description:
        "Real-time technical analysis with support/resistance levels, trend indicators, and pattern recognition.",
      badge: "Essential",
      color: "text-emerald-400",
    },
    {
      icon: Target,
      title: "Smart Signals",
      description: "AI-generated trading signals with entry/exit points, stop-loss levels, and profit targets.",
      badge: "Pro",
      color: "text-orange-400",
    },
    {
      icon: Shield,
      title: "Risk Management",
      description: "Automated risk controls with position sizing, portfolio diversification, and drawdown protection.",
      badge: "Secure",
      color: "text-red-400",
    },
    {
      icon: BarChart3,
      title: "Portfolio Analytics",
      description: "Comprehensive performance tracking with P&L analysis, Sharpe ratios, and risk metrics.",
      badge: "Analytics",
      color: "text-cyan-400",
    },
    {
      icon: Bell,
      title: "Smart Alerts",
      description: "Customizable notifications for price movements, trade executions, and market opportunities.",
      badge: "Real-time",
      color: "text-yellow-400",
    },
    {
      icon: Wallet,
      title: "Multi-Exchange",
      description: "Connect to major exchanges like Binance, Coinbase, and Kraken with unified portfolio management.",
      badge: "Integration",
      color: "text-indigo-400",
    },
    {
      icon: Clock,
      title: "24/7 Trading",
      description: "Round-the-clock automated trading that never sleeps, capturing opportunities in global markets.",
      badge: "Always On",
      color: "text-green-400",
    },
    {
      icon: Users,
      title: "Copy Trading",
      description: "Follow and copy successful traders' strategies with automatic position mirroring.",
      badge: "Social",
      color: "text-pink-400",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Ultra-low latency execution with direct market access and optimized order routing.",
      badge: "Speed",
      color: "text-amber-400",
    },
    {
      icon: Award,
      title: "Proven Results",
      description: "Track record of consistent returns with transparent performance metrics and backtesting.",
      badge: "Verified",
      color: "text-violet-400",
    },
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Platform Features
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            Everything You Need to
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
              Trade Like a Pro
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our comprehensive suite of AI-powered tools and features gives you the edge you need to succeed in
            cryptocurrency trading.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm"
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {feature.badge}
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection
