import { Card, CardContent } from "@/components/ui/card"
import { Bot, Shield, Zap, BarChart3, Users, DollarSign } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: Bot,
      title: "AI-Powered Trading Bots",
      description: "Advanced algorithms that analyze market trends and execute trades automatically 24/7.",
    },
    {
      icon: BarChart3,
      title: "Real-Time Analytics",
      description: "Comprehensive market analysis with live charts, indicators, and performance metrics.",
    },
    {
      icon: Shield,
      title: "Bank-Grade Security",
      description: "Military-grade encryption and secure API connections to protect your assets.",
    },
    {
      icon: Zap,
      title: "Lightning Fast Execution",
      description: "Execute trades in milliseconds with our high-performance trading infrastructure.",
    },
    {
      icon: Users,
      title: "Social Trading",
      description: "Follow successful traders and copy their strategies with automated portfolio management.",
    },
    {
      icon: DollarSign,
      title: "Portfolio Management",
      description: "Advanced portfolio tracking with profit/loss analysis and risk management tools.",
    },
  ]

  return (
    <section id="features" className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Everything You Need to Trade Like a Pro</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Our comprehensive suite of tools and features helps both beginners and experienced traders maximize their
            cryptocurrency investments.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-white/5 backdrop-blur-lg border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105"
            >
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600/20 to-purple-600/20">
                    <feature.icon className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
