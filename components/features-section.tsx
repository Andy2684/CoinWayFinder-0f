import { Bot, TrendingUp, Shield, Zap, BarChart3, Bell } from "lucide-react"

const features = [
  {
    icon: Bot,
    title: "AI Trading Bots",
    description: "Advanced AI algorithms that execute trades 24/7 based on market analysis and your risk preferences.",
    color: "text-blue-400",
  },
  {
    icon: TrendingUp,
    title: "Real-time Signals",
    description: "Get instant trading signals powered by machine learning and technical analysis.",
    color: "text-green-400",
  },
  {
    icon: Shield,
    title: "Risk Management",
    description: "Built-in risk management tools to protect your investments with stop-loss and take-profit orders.",
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
    description: "Comprehensive portfolio analytics and performance tracking with detailed insights.",
    color: "text-pink-400",
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    description: "Customizable alerts for price movements, trading opportunities, and portfolio changes.",
    color: "text-cyan-400",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Powerful Features for
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {" "}
              Smart Trading
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Everything you need to succeed in cryptocurrency trading, powered by cutting-edge technology
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105"
            >
              <div
                className={`w-12 h-12 rounded-lg bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
              >
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-blue-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-300 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
