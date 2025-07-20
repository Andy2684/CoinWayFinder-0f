"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Bot,
  TrendingUp,
  Shield,
  Zap,
  BarChart3,
  Settings,
  Globe,
  Clock,
  Target,
  Smartphone,
  Bell,
  DollarSign,
  ArrowRight,
  CheckCircle,
} from "lucide-react"

const features = [
  {
    icon: Bot,
    title: "AI-Powered Trading Bots",
    description: "Advanced machine learning algorithms that adapt to market conditions and execute trades 24/7.",
    benefits: ["Never miss opportunities", "Emotion-free trading", "Continuous learning"],
    color: "blue",
    popular: true,
  },
  {
    icon: TrendingUp,
    title: "Real-Time Market Analysis",
    description: "Get instant insights with live charts, technical indicators, and market sentiment analysis.",
    benefits: ["Live price feeds", "Technical analysis", "Market sentiment"],
    color: "green",
  },
  {
    icon: Shield,
    title: "Advanced Security",
    description: "Bank-level encryption, secure API connections, and comprehensive risk management tools.",
    benefits: ["256-bit encryption", "Secure API keys", "Risk controls"],
    color: "purple",
  },
  {
    icon: Zap,
    title: "Lightning Fast Execution",
    description: "Ultra-low latency trading with direct exchange connections for optimal trade execution.",
    benefits: ["Sub-second execution", "Direct connections", "Minimal slippage"],
    color: "yellow",
  },
  {
    icon: BarChart3,
    title: "Comprehensive Analytics",
    description: "Detailed performance metrics, profit/loss tracking, and portfolio optimization insights.",
    benefits: ["Performance tracking", "P&L analysis", "Portfolio insights"],
    color: "cyan",
  },
  {
    icon: Settings,
    title: "Customizable Strategies",
    description: "Create and customize trading strategies with our intuitive drag-and-drop interface.",
    benefits: ["Strategy builder", "Backtesting", "Custom indicators"],
    color: "orange",
  },
  {
    icon: Globe,
    title: "Multi-Exchange Support",
    description: "Trade across 15+ major cryptocurrency exchanges from a single unified platform.",
    benefits: ["15+ exchanges", "Unified interface", "Cross-exchange arbitrage"],
    color: "indigo",
  },
  {
    icon: Clock,
    title: "24/7 Automated Trading",
    description: "Your bots work around the clock, capturing opportunities even while you sleep.",
    benefits: ["Never stops trading", "Global markets", "Passive income"],
    color: "pink",
  },
  {
    icon: Target,
    title: "Precision Risk Management",
    description: "Advanced stop-loss, take-profit, and position sizing tools to protect your capital.",
    benefits: ["Stop-loss orders", "Position sizing", "Risk limits"],
    color: "red",
  },
  {
    icon: Smartphone,
    title: "Mobile Trading App",
    description: "Monitor and control your trading bots on-the-go with our native mobile applications.",
    benefits: ["iOS & Android", "Push notifications", "Remote control"],
    color: "teal",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Get instant alerts for important market events, trade executions, and bot status updates.",
    benefits: ["Real-time alerts", "Custom triggers", "Multi-channel"],
    color: "violet",
  },
  {
    icon: DollarSign,
    title: "Profit Optimization",
    description: "AI-driven profit maximization with dynamic rebalancing and compound growth strategies.",
    benefits: ["Compound growth", "Auto-rebalancing", "Profit reinvestment"],
    color: "emerald",
  },
]

export function FeaturesSection() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)

  return (
    <section className="py-24 bg-gradient-to-b from-slate-900 to-slate-800 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 mb-4">Features</Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Everything You Need to
            <span className="block bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Trade Like a Pro
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Our comprehensive suite of tools and features empowers both beginners and experienced traders to maximize
            their cryptocurrency trading potential.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card
              key={index}
              className={`bg-black/40 border-white/10 backdrop-blur-xl hover:bg-black/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl group cursor-pointer relative overflow-hidden ${
                hoveredFeature === index ? `hover:shadow-${feature.color}-500/20` : ""
              }`}
              onMouseEnter={() => setHoveredFeature(index)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              {feature.popular && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold">
                    Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-4">
                <div
                  className={`w-12 h-12 rounded-xl bg-${feature.color}-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className={`h-6 w-6 text-${feature.color}-400`} />
                </div>
                <CardTitle className="text-xl text-white group-hover:text-blue-400 transition-colors">
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-gray-400 leading-relaxed">{feature.description}</CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-2 mb-4">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-center text-sm text-gray-300">
                      <CheckCircle className={`h-4 w-4 text-${feature.color}-400 mr-2 flex-shrink-0`} />
                      {benefit}
                    </li>
                  ))}
                </ul>

                <Button
                  variant="ghost"
                  size="sm"
                  className={`w-full text-${feature.color}-400 hover:bg-${feature.color}-500/20 group-hover:translate-x-1 transition-all`}
                >
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>

              {/* Hover Effect Overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-br from-${feature.color}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}
              />
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Experience All These Features?</h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Join thousands of successful traders who are already using our platform to automate their trading and
              maximize their profits.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 px-8 bg-transparent"
              >
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
