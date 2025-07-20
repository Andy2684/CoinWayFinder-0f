"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Bot,
  TrendingUp,
  Shield,
  Zap,
  BarChart3,
  Brain,
  Clock,
  Target,
  Smartphone,
  Globe,
  Lock,
  AlertTriangle,
} from "lucide-react"

const features = [
  {
    icon: Bot,
    title: "AI-Powered Trading Bots",
    description:
      "Advanced machine learning algorithms that adapt to market conditions and execute trades with precision.",
    badge: "Core Feature",
    color: "text-blue-400",
  },
  {
    icon: Brain,
    title: "Smart Market Analysis",
    description: "Real-time analysis of market trends, sentiment, and technical indicators to make informed decisions.",
    badge: "AI-Driven",
    color: "text-purple-400",
  },
  {
    icon: TrendingUp,
    title: "Portfolio Optimization",
    description: "Automatically rebalance your portfolio based on risk tolerance and market opportunities.",
    badge: "Automated",
    color: "text-green-400",
  },
  {
    icon: Shield,
    title: "Risk Management",
    description: "Built-in stop-loss, take-profit, and position sizing to protect your investments.",
    badge: "Safety First",
    color: "text-yellow-400",
  },
  {
    icon: Clock,
    title: "24/7 Trading",
    description: "Never miss an opportunity with round-the-clock automated trading across global markets.",
    badge: "Always On",
    color: "text-cyan-400",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Comprehensive reporting and analytics to track performance and optimize strategies.",
    badge: "Data-Driven",
    color: "text-orange-400",
  },
  {
    icon: Smartphone,
    title: "Mobile Trading",
    description: "Monitor and control your bots from anywhere with our responsive mobile interface.",
    badge: "Mobile Ready",
    color: "text-pink-400",
  },
  {
    icon: Globe,
    title: "Multi-Exchange Support",
    description: "Connect to major exchanges like Binance, Coinbase, Kraken, and more from one platform.",
    badge: "Universal",
    color: "text-indigo-400",
  },
  {
    icon: Lock,
    title: "Bank-Grade Security",
    description: "Your funds and data are protected with enterprise-level encryption and security protocols.",
    badge: "Secure",
    color: "text-red-400",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-20 px-4 relative">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-purple-500/20 text-purple-300 border-purple-500/30">
            <Zap className="w-4 h-4 mr-2" />
            Powerful Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Everything You Need to
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent block">
              Dominate the Markets
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Our comprehensive suite of AI-powered tools gives you the edge you need to succeed in cryptocurrency
            trading.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 transition-all duration-300 group"
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-white/10 ${feature.color}`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <Badge variant="outline" className="text-xs border-white/20 text-gray-300">
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-white text-xl group-hover:text-blue-300 transition-colors">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300 leading-relaxed">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl p-8 border border-white/10">
            <Target className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Start Trading?</h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Join thousands of successful traders who are already using our AI-powered platform to maximize their
              profits.
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                No hidden fees
              </div>
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-1" />
                Secure & regulated
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                24/7 support
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
