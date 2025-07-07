import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bot, TrendingUp, Shield, Zap, MessageSquare, BarChart3, Target, Clock, Brain } from "lucide-react"

const features = [
  {
    icon: Bot,
    title: "AI Trading Signals",
    description:
      "Advanced machine learning algorithms analyze market patterns to deliver high-accuracy trading signals directly to your Telegram.",
    badge: "95% Accuracy",
  },
  {
    icon: TrendingUp,
    title: "Automated DCA Bots",
    description:
      "Set up dollar-cost averaging strategies that execute automatically based on your preferences and market conditions.",
    badge: "Auto-Pilot",
  },
  {
    icon: Brain,
    title: "Smart Market Analysis",
    description:
      "Real-time sentiment analysis, technical indicators, and market news aggregation to keep you informed.",
    badge: "Real-Time",
  },
  {
    icon: MessageSquare,
    title: "Telegram Integration",
    description:
      "Receive all signals, alerts, and updates directly in Telegram. No need to constantly check multiple platforms.",
    badge: "Instant Alerts",
  },
  {
    icon: Shield,
    title: "Risk Management",
    description:
      "Built-in stop-loss, take-profit, and position sizing tools to protect your capital and maximize returns.",
    badge: "Protected",
  },
  {
    icon: BarChart3,
    title: "Portfolio Tracking",
    description: "Monitor your performance across multiple exchanges with detailed analytics and profit/loss tracking.",
    badge: "Multi-Exchange",
  },
  {
    icon: Target,
    title: "Custom Strategies",
    description: "Create and backtest your own trading strategies or choose from our library of proven strategies.",
    badge: "Customizable",
  },
  {
    icon: Clock,
    title: "24/7 Monitoring",
    description: "Never miss an opportunity with round-the-clock market monitoring and instant notifications.",
    badge: "Always On",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Execute trades in milliseconds with our optimized infrastructure and direct exchange connections.",
    badge: "Ultra-Fast",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-[#30D5C8]/10 text-[#30D5C8] border-[#30D5C8]/20">Features</Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Everything You Need to
            <br />
            <span className="bg-gradient-to-r from-[#30D5C8] to-blue-400 bg-clip-text text-transparent">
              Trade Like a Pro
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Our comprehensive suite of tools and features helps both beginners and experienced traders make informed
            decisions and maximize their crypto trading potential.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-gray-900/50 border-gray-800 hover:border-[#30D5C8]/50 transition-all duration-300 group hover:bg-gray-900/70"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-[#30D5C8]/10 rounded-lg group-hover:bg-[#30D5C8]/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-[#30D5C8]" />
                  </div>
                  <Badge
                    variant="outline"
                    className="text-xs border-gray-600 text-gray-300 group-hover:border-[#30D5C8]/50 group-hover:text-[#30D5C8]"
                  >
                    {feature.badge}
                  </Badge>
                </div>

                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-[#30D5C8] transition-colors">
                  {feature.title}
                </h3>

                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
