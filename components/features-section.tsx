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
        "Advanced machine learning algorithms that analyze market patterns and execute trades automatically with 94% success rate.",
      badge: "Popular",
    },
    {
      icon: TrendingUp,
      title: "Real-time Signals",
      description:
        "Get instant notifications for profitable trading opportunities across all major exchanges with precise entry and exit points.",
      badge: "New",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description:
        "Comprehensive market analysis with technical indicators, sentiment analysis, and predictive modeling for informed decisions.",
      badge: null,
    },
    {
      icon: Shield,
      title: "Risk Management",
      description:
        "Built-in stop-loss and take-profit mechanisms with portfolio diversification to protect your investments from market volatility.",
      badge: null,
    },
    {
      icon: Clock,
      title: "24/7 Trading",
      description:
        "Never miss an opportunity with round-the-clock automated trading capabilities that work while you sleep.",
      badge: null,
    },
    {
      icon: Target,
      title: "Precision Targeting",
      description:
        "Highly accurate entry and exit points based on multiple technical indicators and market sentiment analysis.",
      badge: null,
    },
    {
      icon: Brain,
      title: "Smart Learning",
      description:
        "AI that continuously learns and adapts to changing market conditions, improving performance over time.",
      badge: "AI",
    },
    {
      icon: Smartphone,
      title: "Mobile Ready",
      description:
        "Full-featured mobile app to monitor and control your trades on the go with real-time notifications.",
      badge: null,
    },
    {
      icon: Lock,
      title: "Bank-Grade Security",
      description:
        "Military-grade encryption and security protocols to protect your assets with multi-factor authentication.",
      badge: null,
    },
    {
      icon: Globe,
      title: "Multi-Exchange",
      description:
        "Connect to all major cryptocurrency exchanges from a single platform with unified portfolio management.",
      badge: null,
    },
    {
      icon: Users,
      title: "Community Signals",
      description:
        "Access signals from top traders and share strategies with our active community of successful traders.",
      badge: null,
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description:
        "Ultra-low latency execution with 0.1s response time ensures you never miss profitable opportunities.",
      badge: null,
    },
  ]

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Platform Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              Dominate
            </span>{" "}
            the Markets
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our comprehensive suite of AI-powered tools and features gives you the competitive edge you need to succeed
            in cryptocurrency trading.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white"
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-3 bg-emerald-100 rounded-xl">
                    <feature.icon className="w-6 h-6 text-emerald-600" />
                  </div>
                  {feature.badge && (
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 font-medium">
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
        <div className="mt-20 bg-white rounded-2xl p-8 shadow-lg border">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Trusted by Traders Worldwide</h3>
            <p className="text-gray-600">Join thousands of successful traders who are already using our platform</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-emerald-600 mb-2">50,000+</div>
              <div className="text-gray-600 font-medium">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-emerald-600 mb-2">$100M+</div>
              <div className="text-gray-600 font-medium">Volume Traded</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-emerald-600 mb-2">99.9%</div>
              <div className="text-gray-600 font-medium">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-emerald-600 mb-2">24/7</div>
              <div className="text-gray-600 font-medium">Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
