import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Bot, Shield, Zap, BarChart3, Bell, Globe, Users } from "lucide-react"

export default function FeaturesSection() {
  const features = [
    {
      icon: TrendingUp,
      title: "AI Trading Signals",
      description: "Get real-time trading signals powered by advanced machine learning algorithms with 94% accuracy.",
      badge: "Most Popular",
    },
    {
      icon: Bot,
      title: "Automated Trading Bots",
      description: "Deploy intelligent trading bots that execute trades 24/7 based on your preferred strategies.",
      badge: "New",
    },
    {
      icon: Shield,
      title: "Risk Management",
      description:
        "Advanced risk controls including stop-loss, take-profit, and position sizing to protect your capital.",
      badge: null,
    },
    {
      icon: BarChart3,
      title: "Portfolio Analytics",
      description: "Comprehensive portfolio tracking with detailed performance metrics and profit/loss analysis.",
      badge: null,
    },
    {
      icon: Bell,
      title: "Smart Alerts",
      description:
        "Customizable alerts for price movements, signal triggers, and portfolio changes via multiple channels.",
      badge: null,
    },
    {
      icon: Globe,
      title: "Multi-Exchange Support",
      description:
        "Connect to major exchanges including Binance, Coinbase, Kraken, and more with secure API integration.",
      badge: null,
    },
    {
      icon: Zap,
      title: "Real-time Data",
      description: "Lightning-fast market data processing with sub-second latency for optimal trade execution.",
      badge: null,
    },
    {
      icon: Users,
      title: "Community Insights",
      description: "Access to exclusive trading community with expert analysis and strategy sharing.",
      badge: "Premium",
    },
  ]

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Trade Successfully</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our comprehensive platform provides all the tools and insights you need to make profitable trading decisions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="relative hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <feature.icon className="w-8 h-8 text-emerald-600" />
                  {feature.badge && (
                    <Badge variant={feature.badge === "New" ? "default" : "secondary"} className="text-xs">
                      {feature.badge}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
