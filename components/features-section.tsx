import { Bot, BarChart3, Shield, Zap, TrendingUp, Users } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: Bot,
      title: "AI Trading Bots",
      description:
        "Advanced algorithms that trade 24/7, analyzing market patterns and executing optimal trades automatically.",
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Comprehensive market analysis with live charts, technical indicators, and performance metrics.",
    },
    {
      icon: Shield,
      title: "Bank-level Security",
      description: "Your funds and data are protected with enterprise-grade security and encryption protocols.",
    },
    {
      icon: Zap,
      title: "Lightning Fast Execution",
      description:
        "Execute trades in milliseconds with our high-performance infrastructure and direct exchange connections.",
    },
    {
      icon: TrendingUp,
      title: "Portfolio Management",
      description: "Track your investments, analyze performance, and optimize your portfolio with professional tools.",
    },
    {
      icon: Users,
      title: "Social Trading",
      description: "Follow successful traders, copy their strategies, and learn from the community.",
    },
  ]

  return (
    <section id="features" className="py-20 bg-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Everything You Need to Trade Like a Pro</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Our platform combines cutting-edge technology with user-friendly design to give you the edge in
            cryptocurrency trading.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300"
            >
              <div className="flex items-center mb-4">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white ml-3">{feature.title}</h3>
              </div>
              <p className="text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
