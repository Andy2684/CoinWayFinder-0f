"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bot, TrendingUp, Shield, Zap, BarChart3, Users, Clock, Target, Brain, Smartphone } from "lucide-react"

export default function FeaturesSection() {
  const features = [
    {
      icon: Bot,
      title: "AI Trading Bots",
      description: "Automated trading strategies powered by advanced machine learning algorithms that work 24/7.",
      badge: "Popular",
    },
    {
      icon: TrendingUp,
      title: "Real-time Signals",
      description: "Get instant notifications for profitable trading opportunities across all major cryptocurrencies.",
      badge: "New",
    },
    {
      icon: BarChart3,
      title: "Market Analysis",
      description: "Comprehensive market insights and analytics to help you make informed trading decisions.",
      badge: null,
    },
    {
      icon: Shield,
      title: "Risk Management",
      description: "Advanced risk management tools to protect your investments and minimize losses.",
      badge: null,
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Execute trades in milliseconds with our high-performance trading infrastructure.",
      badge: null,
    },
    {
      icon: Users,
      title: "Community Insights",
      description: "Learn from successful traders and share strategies with our active community.",
      badge: null,
    },
    {
      icon: Clock,
      title: "24/7 Monitoring",
      description: "Continuous market monitoring ensures you never miss a profitable opportunity.",
      badge: null,
    },
    {
      icon: Target,
      title: "Precision Trading",
      description: "High-accuracy signals with detailed entry and exit points for maximum profits.",
      badge: null,
    },
    {
      icon: Brain,
      title: "Smart Analytics",
      description: "AI-powered analytics that learn from market patterns and adapt to changing conditions.",
      badge: "AI",
    },
  ]

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <Smartphone className="w-4 h-4 mr-2" />
            Features
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to <span className="text-emerald-600">Succeed</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our comprehensive suite of tools and features is designed to give you the edge in cryptocurrency trading.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-emerald-600" />
                  </div>
                  {feature.badge && (
                    <Badge variant={feature.badge === "Popular" ? "default" : "secondary"} className="text-xs">
                      {feature.badge}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 leading-relaxed">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Info Section */}
        <div className="mt-20 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg border">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Trusted by Over 50,000+ Traders Worldwide</h3>
            <p className="text-gray-600 mb-6">
              Join thousands of successful traders who are already using our platform to maximize their profits.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">50K+</div>
                <div className="text-sm text-gray-500">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">$100M+</div>
                <div className="text-sm text-gray-500">Volume Traded</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">99.9%</div>
                <div className="text-sm text-gray-500">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">24/7</div>
                <div className="text-sm text-gray-500">Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
