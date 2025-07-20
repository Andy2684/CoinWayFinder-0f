import { Bot, TrendingUp, Shield, Zap, BarChart3, Globe } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: Bot,
      title: "AI Trading Bots",
      description:
        "Advanced algorithms that trade 24/7, analyzing market patterns and executing optimal trades automatically.",
    },
    {
      icon: TrendingUp,
      title: "Real-time Analytics",
      description:
        "Comprehensive market analysis with live charts, indicators, and predictive insights to guide your decisions.",
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Bank-grade security with encrypted data, secure API connections, and cold storage protection.",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Ultra-low latency execution ensures you never miss profitable opportunities in volatile markets.",
    },
    {
      icon: BarChart3,
      title: "Portfolio Management",
      description: "Track performance, manage risk, and optimize your portfolio with advanced analytics and reporting.",
    },
    {
      icon: Globe,
      title: "Multi-Exchange",
      description: "Connect to major exchanges worldwide and trade across multiple markets from a single platform.",
    },
  ]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Powerful Features for
            <span className="block text-blue-400">Professional Trading</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Everything you need to succeed in cryptocurrency trading, powered by cutting-edge technology
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-blue-500/50 transition-all duration-300 hover:transform hover:scale-105"
            >
              <div className="flex items-center mb-4">
                <div className="p-3 bg-blue-500/20 rounded-lg mr-4">
                  <feature.icon className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
              </div>
              <p className="text-gray-300 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
