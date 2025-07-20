"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bot, TrendingUp, Shield, Zap, BarChart3, Users } from "lucide-react"

const features = [
  {
    icon: Bot,
    title: "AI Trading Bots",
    description: "Advanced algorithms that analyze market patterns and execute trades automatically",
    badge: "Popular",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: TrendingUp,
    title: "Real-time Analytics",
    description: "Live market data, price alerts, and comprehensive trading insights",
    badge: "New",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: Shield,
    title: "Secure Trading",
    description: "Bank-level security with encrypted API keys and secure wallet connections",
    badge: "Secure",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Execute trades in milliseconds with our optimized trading infrastructure",
    badge: "Fast",
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    icon: BarChart3,
    title: "Portfolio Management",
    description: "Track performance, manage risk, and optimize your trading strategies",
    badge: "Pro",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    icon: Users,
    title: "Community Signals",
    description: "Access trading signals from top performers and share your strategies",
    badge: "Social",
    gradient: "from-pink-500 to-rose-500",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-blue-500/20 text-blue-300 border-blue-500/30">Features</Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Dominate</span>{" "}
            Crypto Trading
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Our comprehensive suite of tools and features helps you trade like a pro, whether you're a beginner or an
            experienced trader.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-black/40 border-white/10 backdrop-blur-xl hover:bg-black/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 group cursor-pointer hover:scale-105"
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-3 rounded-lg bg-gradient-to-r ${feature.gradient} bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300`}
                  >
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-white/10 text-white border-white/20 group-hover:bg-white/20 transition-all duration-300"
                  >
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-white text-xl group-hover:text-blue-300 transition-colors duration-300">
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

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-300 mb-6">Ready to experience the future of crypto trading?</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30 px-4 py-2">
              <Shield className="h-4 w-4 mr-2" />
              100% Secure
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 px-4 py-2">
              <Zap className="h-4 w-4 mr-2" />
              Instant Setup
            </Badge>
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 px-4 py-2">
              <Users className="h-4 w-4 mr-2" />
              24/7 Support
            </Badge>
          </div>
        </div>
      </div>
    </section>
  )
}
