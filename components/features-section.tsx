"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bot, Shield, Zap, BarChart3, Bell, Smartphone, Globe, Lock, Activity, Target, Cpu } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: Bot,
      title: "AI Trading Bots",
      description: "Advanced machine learning algorithms that adapt to market conditions and execute trades 24/7.",
      badge: "Popular",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: BarChart3,
      title: "Real-Time Analytics",
      description: "Comprehensive market analysis with live charts, indicators, and performance metrics.",
      badge: "Pro",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Shield,
      title: "Risk Management",
      description: "Sophisticated risk controls with stop-loss, take-profit, and position sizing automation.",
      badge: "Essential",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Bell,
      title: "Smart Alerts",
      description: "Instant notifications for price movements, trade executions, and market opportunities.",
      badge: "New",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: Globe,
      title: "Multi-Exchange",
      description: "Connect to major exchanges like Binance, Coinbase, Kraken, and more from one platform.",
      badge: "Premium",
      color: "from-indigo-500 to-purple-500",
    },
    {
      icon: Smartphone,
      title: "Mobile Trading",
      description: "Full-featured mobile app for iOS and Android with push notifications and live monitoring.",
      badge: "Free",
      color: "from-teal-500 to-cyan-500",
    },
  ]

  const additionalFeatures = [
    {
      icon: Lock,
      title: "Bank-Grade Security",
      description: "End-to-end encryption, 2FA, and cold storage integration for maximum security.",
    },
    {
      icon: Activity,
      title: "Portfolio Tracking",
      description: "Real-time portfolio monitoring with P&L tracking and performance analytics.",
    },
    {
      icon: Target,
      title: "Strategy Builder",
      description: "Visual strategy builder with backtesting and optimization tools.",
    },
    {
      icon: Cpu,
      title: "High-Speed Execution",
      description: "Ultra-low latency trading with direct market access and co-location.",
    },
  ]

  return (
    <section className="py-20 px-4 relative">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Powerful Features for{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Professional Trading
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Everything you need to automate your cryptocurrency trading and maximize your profits
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl group"
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-r ${feature.color} shadow-lg group-hover:shadow-xl transition-all duration-300`}
                  >
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-white/10 text-white border-white/20 hover:bg-white/20 transition-colors"
                  >
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-white text-xl group-hover:text-blue-300 transition-colors">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300 text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Features */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">And Much More...</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalFeatures.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-gray-700/50 to-gray-600/50 mb-4 mx-auto w-fit group-hover:from-blue-600/50 group-hover:to-purple-600/50 transition-all duration-300">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-white font-semibold mb-2 group-hover:text-blue-300 transition-colors">
                  {feature.title}
                </h4>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Highlight */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-xl rounded-full px-6 py-3 border border-blue-500/30">
            <Zap className="h-5 w-5 text-blue-400" />
            <span className="text-white font-medium">Join 10,000+ traders already using CoinWayFinder</span>
          </div>
        </div>
      </div>
    </section>
  )
}
