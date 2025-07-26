"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bot, BarChart3, Shield, Zap, TrendingUp, Users, Globe, Lock } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: Bot,
      title: "AI Trading Bots",
      description:
        "Advanced machine learning algorithms that adapt to market conditions and execute trades automatically.",
      category: "Popular",
      color: "bg-blue-500/10 text-blue-400 border-blue-400/30",
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Comprehensive market analysis with live charts, indicators, and performance tracking.",
      category: "Pro",
      color: "bg-purple-500/10 text-purple-400 border-purple-400/30",
    },
    {
      icon: Shield,
      title: "Risk Management",
      description: "Built-in stop-loss, take-profit, and portfolio diversification tools to protect your investments.",
      category: "Essential",
      color: "bg-green-500/10 text-green-400 border-green-400/30",
    },
    {
      icon: Zap,
      title: "Lightning Fast Execution",
      description: "Ultra-low latency trading with direct exchange connections for optimal order execution.",
      category: "Pro",
      color: "bg-purple-500/10 text-purple-400 border-purple-400/30",
    },
    {
      icon: TrendingUp,
      title: "Portfolio Optimization",
      description: "AI-powered portfolio rebalancing and asset allocation strategies for maximum returns.",
      category: "Popular",
      color: "bg-blue-500/10 text-blue-400 border-blue-400/30",
    },
    {
      icon: Users,
      title: "Social Trading",
      description: "Follow successful traders, copy their strategies, and learn from the community.",
      category: "Essential",
      color: "bg-green-500/10 text-green-400 border-green-400/30",
    },
    {
      icon: Globe,
      title: "Multi-Exchange Support",
      description: "Connect to major exchanges like Binance, Coinbase, Kraken, and more from one platform.",
      category: "Pro",
      color: "bg-purple-500/10 text-purple-400 border-purple-400/30",
    },
    {
      icon: Lock,
      title: "Bank-Grade Security",
      description: "Military-grade encryption, 2FA, and cold storage integration to keep your assets safe.",
      category: "Essential",
      color: "bg-green-500/10 text-green-400 border-green-400/30",
    },
  ]

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Powerful Features for{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Professional Trading
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Everything you need to automate your cryptocurrency trading and maximize your profits
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-gray-800/50 border-gray-700 backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-300 group"
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-gray-700/50 group-hover:bg-gray-700/70 transition-colors">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant="secondary" className={feature.color}>
                    {feature.category}
                  </Badge>
                </div>
                <CardTitle className="text-white text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
