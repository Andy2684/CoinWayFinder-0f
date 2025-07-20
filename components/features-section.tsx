"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Bot,
  TrendingUp,
  Shield,
  Zap,
  BarChart3,
  Globe,
  Smartphone,
  Clock,
  Target,
  Users,
  Award,
  Cpu,
} from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: Bot,
      title: "AI-Powered Trading Bots",
      description:
        "Advanced machine learning algorithms that adapt to market conditions and execute trades automatically.",
      badge: "Popular",
      color: "text-blue-400",
    },
    {
      icon: TrendingUp,
      title: "Real-Time Market Analysis",
      description: "Live market data, technical indicators, and sentiment analysis to make informed trading decisions.",
      badge: "Essential",
      color: "text-green-400",
    },
    {
      icon: Shield,
      title: "Bank-Grade Security",
      description: "Multi-layer security protocols, cold storage, and insurance protection for your digital assets.",
      badge: "Secure",
      color: "text-purple-400",
    },
    {
      icon: Zap,
      title: "Lightning Fast Execution",
      description: "Ultra-low latency trading with direct exchange connections for optimal order execution.",
      badge: "Fast",
      color: "text-yellow-400",
    },
    {
      icon: BarChart3,
      title: "Advanced Portfolio Analytics",
      description: "Comprehensive performance tracking, risk analysis, and detailed reporting tools.",
      badge: "Pro",
      color: "text-orange-400",
    },
    {
      icon: Globe,
      title: "Multi-Exchange Support",
      description: "Connect to 50+ major cryptocurrency exchanges worldwide with unified portfolio management.",
      badge: "Global",
      color: "text-cyan-400",
    },
    {
      icon: Smartphone,
      title: "Mobile Trading App",
      description: "Trade on-the-go with our native mobile apps for iOS and Android with full feature parity.",
      badge: "Mobile",
      color: "text-pink-400",
    },
    {
      icon: Clock,
      title: "24/7 Automated Trading",
      description: "Never miss market opportunities with round-the-clock automated trading strategies.",
      badge: "Always On",
      color: "text-indigo-400",
    },
    {
      icon: Target,
      title: "Smart Risk Management",
      description: "Intelligent stop-loss, take-profit, and position sizing to protect your investments.",
      badge: "Smart",
      color: "text-red-400",
    },
    {
      icon: Users,
      title: "Copy Trading",
      description: "Follow and copy successful traders' strategies with transparent performance metrics.",
      badge: "Social",
      color: "text-emerald-400",
    },
    {
      icon: Award,
      title: "Backtesting Engine",
      description: "Test your strategies against historical data before deploying real capital.",
      badge: "Testing",
      color: "text-violet-400",
    },
    {
      icon: Cpu,
      title: "Custom Strategy Builder",
      description: "Build and deploy custom trading strategies with our visual strategy designer.",
      badge: "Custom",
      color: "text-teal-400",
    },
  ]

  return (
    <section className="py-24 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Everything You Need to
            <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Dominate the Markets
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Our comprehensive suite of trading tools and features gives you the edge you need to succeed in
            cryptocurrency markets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 group"
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <feature.icon className={`w-12 h-12 ${feature.color} group-hover:scale-110 transition-transform`} />
                  <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-xl text-white group-hover:text-blue-400 transition-colors">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
