import { Bot, TrendingUp, Shield, Zap, BarChart3, Users } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: Bot,
      title: "AI Trading Bots",
      description: "Advanced machine learning algorithms that adapt to market conditions and execute trades 24/7.",
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: TrendingUp,
      title: "Real-time Analytics",
      description: "Live market data, technical indicators, and sentiment analysis to make informed decisions.",
      color: "text-green-400",
      bgColor: "bg-green-500/10",
    },
    {
      icon: Shield,
      title: "Bank-Grade Security",
      description: "Military-grade encryption and secure API connections to protect your assets and data.",
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Ultra-low latency execution with direct exchange connections for optimal trade timing.",
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Comprehensive portfolio tracking, P&L analysis, and performance metrics dashboard.",
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
    },
    {
      icon: Users,
      title: "Community Signals",
      description: "Access to expert trading signals and strategies from our community of professional traders.",
      color: "text-pink-400",
      bgColor: "bg-pink-500/10",
    },
  ]

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Powerful Features for
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {" "}
              Smart Trading
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Everything you need to automate and optimize your cryptocurrency trading strategy
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105"
            >
              <div
                className={`${feature.bgColor} ${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
              >
                <feature.icon className="w-8 h-8" />
              </div>

              <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-blue-400 transition-colors duration-300">
                {feature.title}
              </h3>

              <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                {feature.description}
              </p>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
