import { Bot, Brain, Shield, Zap, BarChart3, Bell } from "lucide-react"

const features = [
  {
    icon: Bot,
    title: "AI Trading Bots",
    description: "Advanced AI algorithms that learn from market patterns and execute trades automatically.",
  },
  {
    icon: Brain,
    title: "Smart Analytics",
    description: "Real-time market analysis with predictive insights and trend identification.",
  },
  {
    icon: Shield,
    title: "Secure Trading",
    description: "Bank-level security with encrypted API connections and secure fund management.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Execute trades in milliseconds with our high-performance trading infrastructure.",
  },
  {
    icon: BarChart3,
    title: "Portfolio Management",
    description: "Comprehensive portfolio tracking with detailed performance analytics and reporting.",
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    description: "Intelligent notifications for market opportunities and portfolio changes.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Powerful Features for{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Professional Trading
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Everything you need to automate your crypto trading and maximize your profits
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg mb-4">
                <feature.icon className="h-6 w-6 text-white" />
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
