import { Card, CardContent } from "@/components/ui/card"
import { Bot, TrendingUp, Shield, Zap, BarChart3, Users } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: Bot,
      title: "AI-Powered Trading Bots",
      description:
        "Advanced machine learning algorithms that analyze market patterns and execute trades automatically, working 24/7 to maximize your profits.",
    },
    {
      icon: TrendingUp,
      title: "Real-Time Market Signals",
      description:
        "Get instant notifications about profitable trading opportunities with our advanced signal detection system.",
    },
    {
      icon: Shield,
      title: "Bank-Grade Security",
      description:
        "Your funds and data are protected with military-grade encryption and secure API connections to major exchanges.",
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
      description:
        "Comprehensive portfolio tracking, performance analytics, and detailed reporting to optimize your trading strategy.",
    },
    {
      icon: Users,
      title: "Community & Support",
      description: "Join thousands of successful traders and get 24/7 support from our expert team.",
    },
  ]

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Everything You Need to
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {" "}
              Trade Smarter
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Our comprehensive platform provides all the tools and features you need to succeed in cryptocurrency
            trading.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-white/5 backdrop-blur-lg border-white/10 hover:bg-white/10 transition-all duration-300"
            >
              <CardContent className="p-8">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl flex items-center justify-center mb-4">
                    <feature.icon className="h-8 w-8 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
