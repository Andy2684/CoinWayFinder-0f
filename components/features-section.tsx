import { TrendingUp, Zap, Shield, BarChart3, Bell, Users } from "lucide-react"

export default function FeaturesSection() {
  const features = [
    {
      icon: TrendingUp,
      title: "AI-Powered Signals",
      description:
        "Advanced machine learning algorithms analyze market patterns to provide high-accuracy trading signals with real-time updates.",
    },
    {
      icon: Zap,
      title: "Automated Trading Bots",
      description:
        "Deploy intelligent bots that execute trades 24/7 based on your strategy, risk tolerance, and market conditions.",
    },
    {
      icon: Shield,
      title: "Risk Management",
      description:
        "Comprehensive risk controls including stop-loss, take-profit, and position sizing to protect your investments.",
    },
    {
      icon: BarChart3,
      title: "Portfolio Analytics",
      description:
        "Detailed performance tracking with advanced charts, P&L analysis, and portfolio optimization insights.",
    },
    {
      icon: Bell,
      title: "Real-time Alerts",
      description:
        "Instant notifications for market opportunities, bot activities, and important portfolio changes via multiple channels.",
    },
    {
      icon: Users,
      title: "Community Insights",
      description:
        "Access to expert traders' strategies, community discussions, and collaborative trading opportunities.",
    },
  ]

  return (
    <section id="features" className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything You Need to Trade Smarter</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our comprehensive platform combines cutting-edge AI technology with professional trading tools to give you
            the edge in cryptocurrency markets.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
