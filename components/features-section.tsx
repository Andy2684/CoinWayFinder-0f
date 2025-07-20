import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, TrendingUp, Shield, Zap, BarChart3, Users } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: Bot,
      title: "AI Trading Bots",
      description: "Advanced algorithms that learn from market patterns and execute trades 24/7 with precision.",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: TrendingUp,
      title: "Real-Time Analytics",
      description: "Live market data, technical indicators, and performance metrics at your fingertips.",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: Shield,
      title: "Bank-Grade Security",
      description: "Your funds and data are protected with enterprise-level encryption and security protocols.",
      gradient: "from-purple-500 to-violet-500",
    },
    {
      icon: Zap,
      title: "Lightning Fast Execution",
      description:
        "Execute trades in milliseconds with our high-performance infrastructure and direct exchange connections.",
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      icon: BarChart3,
      title: "Advanced Portfolio Management",
      description: "Track performance, manage risk, and optimize your trading strategies with comprehensive tools.",
      gradient: "from-red-500 to-pink-500",
    },
    {
      icon: Users,
      title: "Community & Signals",
      description: "Join thousands of traders sharing strategies, signals, and market insights in real-time.",
      gradient: "from-indigo-500 to-blue-500",
    },
  ]

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Everything You Need to
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent block">
              Dominate the Markets
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Our comprehensive suite of tools and features gives you the edge you need to succeed in cryptocurrency
            trading.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-black/40 border-white/10 backdrop-blur-xl hover:bg-black/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 group cursor-pointer hover:scale-105"
            >
              <CardHeader>
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.gradient} p-3 mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-white text-xl group-hover:text-blue-400 transition-colors">
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
          <p className="text-gray-400 mb-4">Ready to experience the future of trading?</p>
          <div className="flex justify-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-0.5 rounded-lg">
              <div className="bg-black/40 backdrop-blur-xl rounded-lg px-6 py-3">
                <span className="text-white font-medium">Join 10,000+ successful traders today</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
