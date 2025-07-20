import { Bot, TrendingUp, Shield, Zap, BarChart3, Bell } from "lucide-react"

const features = [
  {
    icon: Bot,
    title: "AI-Powered Trading Bots",
    description: "Advanced algorithms that learn from market patterns and execute trades 24/7 with precision.",
  },
  {
    icon: TrendingUp,
    title: "Real-Time Market Analysis",
    description: "Get instant insights with live market data, technical indicators, and sentiment analysis.",
  },
  {
    icon: Shield,
    title: "Bank-Grade Security",
    description: "Your funds and data are protected with enterprise-level encryption and security protocols.",
  },
  {
    icon: Zap,
    title: "Lightning Fast Execution",
    description:
      "Execute trades in milliseconds with our high-performance infrastructure and direct exchange connections.",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Comprehensive portfolio tracking, P&L analysis, and detailed performance metrics.",
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    description:
      "Never miss an opportunity with customizable alerts for price movements, bot actions, and market events.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Dominate Crypto
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Our comprehensive suite of tools and features gives you the edge you need to succeed in the fast-paced world
            of cryptocurrency trading.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300"
            >
              <div className="flex items-center mb-4">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
