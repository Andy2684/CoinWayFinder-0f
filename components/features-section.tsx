import { Bot, TrendingUp, Shield, Zap, BarChart3, Bell, Globe, Lock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function FeaturesSection() {
  const features = [
    {
      icon: Bot,
      title: "AI Trading Bots",
      description:
        "Advanced machine learning algorithms that adapt to market conditions and execute trades automatically.",
      color: "text-blue-400",
    },
    {
      icon: TrendingUp,
      title: "Real-time Analysis",
      description: "Get instant market insights with our powerful analytics engine and technical indicators.",
      color: "text-green-400",
    },
    {
      icon: Shield,
      title: "Secure Trading",
      description: "Bank-level security with encrypted API connections and secure wallet integrations.",
      color: "text-purple-400",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Execute trades in milliseconds with our high-performance trading infrastructure.",
      color: "text-yellow-400",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Comprehensive portfolio tracking with detailed performance metrics and reporting.",
      color: "text-cyan-400",
    },
    {
      icon: Bell,
      title: "Smart Alerts",
      description: "Customizable notifications for price movements, trade executions, and market opportunities.",
      color: "text-orange-400",
    },
    {
      icon: Globe,
      title: "Multi-Exchange",
      description: "Connect to multiple exchanges and trade across different markets from one platform.",
      color: "text-pink-400",
    },
    {
      icon: Lock,
      title: "Risk Management",
      description: "Built-in risk controls with stop-loss, take-profit, and position sizing features.",
      color: "text-red-400",
    },
  ]

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Powerful Features for
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {" "}
              Modern Traders
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Everything you need to succeed in cryptocurrency trading, powered by cutting-edge AI technology.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 group"
            >
              <CardHeader className="pb-4">
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <CardTitle className="text-white text-lg font-semibold">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300 leading-relaxed">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-300 mb-6">Ready to experience the future of crypto trading?</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105">
              Start Free Trial
            </button>
            <button className="border border-white/20 text-white hover:bg-white/10 px-8 py-3 rounded-full font-semibold backdrop-blur-sm transition-all duration-300">
              View Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
