import { Bot, TrendingUp, Shield, Zap, BarChart3, Bell } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function FeaturesSection() {
  const features = [
    {
      icon: Bot,
      title: "AI Trading Bots",
      description:
        "Advanced AI algorithms that analyze market patterns and execute trades automatically with precision and speed.",
      color: "text-blue-400",
    },
    {
      icon: TrendingUp,
      title: "Real-time Signals",
      description: "Get instant trading signals based on technical analysis, market sentiment, and AI predictions.",
      color: "text-green-400",
    },
    {
      icon: Shield,
      title: "Secure Trading",
      description: "Bank-level security with encrypted API connections and secure wallet integrations.",
      color: "text-purple-400",
    },
    {
      icon: BarChart3,
      title: "Portfolio Analytics",
      description: "Comprehensive portfolio tracking with detailed performance metrics and risk analysis.",
      color: "text-orange-400",
    },
    {
      icon: Bell,
      title: "Smart Alerts",
      description: "Customizable alerts for price movements, trading opportunities, and portfolio changes.",
      color: "text-red-400",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Ultra-low latency execution with direct exchange connections for optimal trading performance.",
      color: "text-yellow-400",
    },
  ]

  return (
    <section id="features" className="py-20 lg:py-32 bg-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Powerful Features for
            <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Professional Trading
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Everything you need to succeed in cryptocurrency trading, powered by cutting-edge AI technology.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
            >
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center mb-4`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <CardTitle className="text-white text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300 text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
