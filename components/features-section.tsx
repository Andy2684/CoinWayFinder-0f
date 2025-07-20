"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Bot,
  TrendingUp,
  Shield,
  Zap,
  BarChart3,
  Target,
  Clock,
  Globe,
  Brain,
  Lock,
  Smartphone,
  DollarSign,
} from "lucide-react"

const features = [
  {
    icon: Bot,
    title: "AI-Powered Bots",
    description:
      "Advanced machine learning algorithms that adapt to market conditions and optimize trading strategies in real-time.",
    badge: "Popular",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: TrendingUp,
    title: "Smart Analytics",
    description: "Comprehensive market analysis with predictive insights to help you make informed trading decisions.",
    badge: "New",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: Shield,
    title: "Bank-Grade Security",
    description: "Military-grade encryption and multi-layer security protocols to keep your assets safe and secure.",
    badge: "Secure",
    gradient: "from-purple-500 to-violet-500",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Execute trades in milliseconds with our high-performance infrastructure and direct exchange connections.",
    badge: "Fast",
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    icon: BarChart3,
    title: "Advanced Charting",
    description: "Professional-grade charts with 100+ technical indicators and customizable trading interfaces.",
    badge: "Pro",
    gradient: "from-red-500 to-pink-500",
  },
  {
    icon: Target,
    title: "Precision Trading",
    description: "Automated risk management and position sizing to maximize profits while minimizing losses.",
    badge: "Smart",
    gradient: "from-indigo-500 to-blue-500",
  },
  {
    icon: Clock,
    title: "24/7 Trading",
    description: "Never miss an opportunity with round-the-clock automated trading across global markets.",
    badge: "Always On",
    gradient: "from-teal-500 to-cyan-500",
  },
  {
    icon: Globe,
    title: "Multi-Exchange",
    description: "Connect to 15+ major exchanges and trade hundreds of cryptocurrency pairs from one platform.",
    badge: "Global",
    gradient: "from-emerald-500 to-green-500",
  },
  {
    icon: Brain,
    title: "Machine Learning",
    description: "Self-improving algorithms that learn from market patterns and continuously optimize performance.",
    badge: "AI",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: Lock,
    title: "API Security",
    description: "Secure API connections with read-only permissions - we never have access to your funds.",
    badge: "Safe",
    gradient: "from-gray-500 to-slate-500",
  },
  {
    icon: Smartphone,
    title: "Mobile Ready",
    description: "Full-featured mobile app to monitor and control your trading bots from anywhere in the world.",
    badge: "Mobile",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: DollarSign,
    title: "Profit Tracking",
    description: "Detailed P&L reports, tax documentation, and performance analytics to track your success.",
    badge: "Reports",
    gradient: "from-amber-500 to-yellow-500",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-20 px-4 relative">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-purple-500/20 text-purple-300 border-purple-500/30">
            Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Everything You Need to
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent block mt-2">
              Dominate the Markets
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Our comprehensive suite of trading tools and AI-powered features gives you the edge you need to succeed in
            today's competitive cryptocurrency markets.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 group"
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${feature.gradient} bg-opacity-20`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <Badge variant="secondary" className="bg-white/10 text-white border-white/20 text-xs">
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
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Experience the Future of Trading?</h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Join thousands of successful traders who are already using our AI-powered platform to maximize their
              profits and minimize their risks.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Badge variant="outline" className="border-green-500/30 text-green-400 bg-green-500/10">
                <TrendingUp className="w-4 h-4 mr-2" />
                98.7% Success Rate
              </Badge>
              <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/10">
                <Shield className="w-4 h-4 mr-2" />
                Bank-Grade Security
              </Badge>
              <Badge variant="outline" className="border-purple-500/30 text-purple-400 bg-purple-500/10">
                <Zap className="w-4 h-4 mr-2" />
                Lightning Fast
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
