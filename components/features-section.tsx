import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, TrendingUp, Shield, Zap, Globe, BarChart3 } from "lucide-react"

const features = [
  {
    icon: Bot,
    title: "AI-Powered Bots",
    description:
      "Advanced machine learning algorithms analyze market trends and execute trades automatically with superhuman precision.",
  },
  {
    icon: TrendingUp,
    title: "Smart Strategies",
    description:
      "Multiple trading strategies including DCA, Grid Trading, Scalping, and Arbitrage optimized for maximum returns.",
  },
  {
    icon: Shield,
    title: "Risk Management",
    description:
      "Built-in stop-loss, take-profit, and portfolio diversification features protect your investments from market volatility.",
  },
  {
    icon: Zap,
    title: "Real-Time Execution",
    description:
      "Lightning-fast order execution across multiple exchanges ensures you never miss profitable opportunities.",
  },
  {
    icon: Globe,
    title: "Multi-Exchange Support",
    description:
      "Connect to Binance, Bybit, KuCoin, OKX, and more. Trade on your favorite exchanges from one dashboard.",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description:
      "Comprehensive performance tracking, profit/loss analysis, and detailed reporting to optimize your trading strategy.",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-24 px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white sm:text-5xl">
            Everything You Need to
            <span className="text-[#30D5C8] block">Dominate Crypto Trading</span>
          </h2>
          <p className="mt-6 text-lg text-gray-300 max-w-3xl mx-auto">
            Our platform combines cutting-edge AI technology with professional trading tools to give you the edge in
            cryptocurrency markets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-gray-900/50 border-gray-700 hover:border-[#30D5C8]/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-[#30D5C8]/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-[#30D5C8]" />
                </div>
                <CardTitle className="text-white">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
