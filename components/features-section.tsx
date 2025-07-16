"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Bot,
  TrendingUp,
  Shield,
  Zap,
  BarChart3,
  Bell,
  Smartphone,
  Globe,
  Brain,
  Target,
  Clock,
  DollarSign,
} from "lucide-react"

const features = [
  {
    icon: Brain,
    title: "AI-Powered Signals",
    description:
      "Advanced machine learning algorithms analyze market patterns and sentiment to generate high-accuracy trading signals.",
    badge: "AI-Driven",
    color: "text-blue-500",
  },
  {
    icon: Bot,
    title: "Automated Trading Bots",
    description: "Deploy sophisticated trading bots that execute strategies 24/7, even while you sleep.",
    badge: "Automated",
    color: "text-green-500",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description: "Comprehensive dashboards with live market data, portfolio tracking, and performance metrics.",
    badge: "Live Data",
    color: "text-purple-500",
  },
  {
    icon: Shield,
    title: "Bank-Grade Security",
    description: "Military-grade encryption and secure API connections protect your assets and trading data.",
    badge: "Secure",
    color: "text-red-500",
  },
  {
    icon: Target,
    title: "Risk Management",
    description: "Advanced risk controls including stop-loss, take-profit, and position sizing automation.",
    badge: "Risk Control",
    color: "text-orange-500",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Get instant alerts for market opportunities, bot performance, and portfolio changes.",
    badge: "Alerts",
    color: "text-yellow-500",
  },
  {
    icon: Smartphone,
    title: "Mobile Trading",
    description: "Full-featured mobile app for trading on the go with push notifications and live updates.",
    badge: "Mobile",
    color: "text-pink-500",
  },
  {
    icon: Globe,
    title: "Multi-Exchange Support",
    description: "Connect to major exchanges like Binance, Coinbase, Kraken, and more from one platform.",
    badge: "Multi-Exchange",
    color: "text-indigo-500",
  },
  {
    icon: Clock,
    title: "24/7 Monitoring",
    description: "Continuous market monitoring and automated execution ensure you never miss an opportunity.",
    badge: "Always On",
    color: "text-teal-500",
  },
  {
    icon: DollarSign,
    title: "Profit Optimization",
    description: "Dynamic strategy adjustment and portfolio rebalancing to maximize returns and minimize losses.",
    badge: "Optimized",
    color: "text-emerald-500",
  },
  {
    icon: TrendingUp,
    title: "Backtesting Engine",
    description: "Test your strategies against historical data to validate performance before going live.",
    badge: "Validated",
    color: "text-cyan-500",
  },
  {
    icon: Zap,
    title: "Lightning Fast Execution",
    description: "Ultra-low latency trading execution with direct exchange connections for optimal fills.",
    badge: "Fast",
    color: "text-violet-500",
  },
]

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            Platform Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Everything You Need to
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Succeed</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Our comprehensive suite of tools and features empowers both beginners and professional traders to achieve
            their financial goals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-600 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Ready to experience the future of crypto trading?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105">
              Start Free Trial
            </button>
            <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-300">
              View Pricing
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
