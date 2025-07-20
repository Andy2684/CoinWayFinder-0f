"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Bot,
  TrendingUp,
  Shield,
  Zap,
  BarChart3,
  Users,
  Clock,
  Target,
  Brain,
  Smartphone,
  Lock,
  Globe,
} from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: Bot,
      title: "AI Trading Bots",
      description:
        "Advanced machine learning algorithms that analyze market patterns and execute trades automatically.",
      badge: "Popular",
    },
    {
      icon: TrendingUp,
      title: "Real-time Signals",
      description: "Get instant notifications for profitable trading opportunities across all major exchanges.",
      badge: "New",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Comprehensive market analysis with technical indicators and sentiment analysis.",
      badge: null,
    },
    {
      icon: Shield,
      title: "Risk Management",
      description: "Built-in stop-loss and take-profit mechanisms to protect your investments.",
      badge: null,
    },
    {
      icon: Clock,
      title: "24/7 Trading",
      description: "Never miss an opportunity with round-the-clock automated trading capabilities.",
      badge: null,
    },
    {
      icon: Target,
      title: "Precision Targeting",
      description: "Highly accurate entry and exit points based on multiple technical indicators.",
      badge: null,
    },
    {
      icon: Brain,
      title: "Smart Learning",
      description: "AI that continuously learns and adapts to changing market conditions.",
      badge: "AI",
    },
    {
      icon: Smartphone,
      title: "Mobile Ready",
      description: "Full-featured mobile app to monitor and control your trades on the go.",
      badge: null,
    },
    {
      icon: Lock,
      title: "Bank-Grade Security",
      description: "Military-grade encryption and security protocols to protect your assets.",
      badge: null,
    },
    {
      icon: Globe,
      title: "Multi-Exchange",
      description: "Connect to all major cryptocurrency exchanges from a single platform.",
      badge: null,
    },
    {
      icon: Users,
      title: "Community Signals",
      description: "Access signals from top traders and share strategies with the community.",
      badge: null,
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Ultra-low latency execution ensures you never miss profitable opportunities.",
      badge: null,
    },
  ]

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              Dominate
            </span>{" "}
            the Markets
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our comprehensive suite of tools and features gives you the edge you need to succeed in cryptocurrency
            trading.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <feature.icon className="w-6 h-6 text-emerald-600" />
                  </div>
                  {feature.badge && (
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                      {feature.badge}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-xl text-gray-900">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 leading-relaxed">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-20 bg-white rounded-2xl p-8 shadow-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-emerald-600 mb-2">10,000+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-emerald-600 mb-2">$100M+</div>
              <div className="text-gray-600">Volume Traded</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-emerald-600 mb-2">99.9%</div>
              <div className="text-gray-600">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-emerald-600 mb-2">24/7</div>
              <div className="text-gray-600">Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
