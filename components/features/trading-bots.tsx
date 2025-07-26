"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bot, Brain, Target, Zap, TrendingUp, Activity, Settings, Play } from "lucide-react"

export function TradingBots() {
  const botTypes = [
    {
      icon: Brain,
      name: "AI Neural Network Bots",
      description: "Advanced machine learning algorithms that adapt to market conditions in real-time",
      features: ["Deep Learning", "Pattern Recognition", "Adaptive Strategies", "Risk Assessment"],
      performance: "87% Win Rate",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Target,
      name: "Strategy-Based Bots",
      description: "Pre-configured trading strategies based on proven technical analysis methods",
      features: ["RSI Trading", "MACD Signals", "Bollinger Bands", "Moving Averages"],
      performance: "78% Win Rate",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Zap,
      name: "Scalping Bots",
      description: "High-frequency trading bots designed for quick profits on small price movements",
      features: ["Millisecond Execution", "Volume Analysis", "Spread Trading", "Arbitrage"],
      performance: "92% Accuracy",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: TrendingUp,
      name: "Trend Following Bots",
      description: "Long-term bots that identify and follow major market trends for sustained profits",
      features: ["Trend Analysis", "Momentum Indicators", "Support/Resistance", "Position Sizing"],
      performance: "73% Win Rate",
      color: "from-orange-500 to-red-500",
    },
  ]

  const botFeatures = [
    {
      icon: Activity,
      title: "24/7 Automated Trading",
      description: "Never miss a trading opportunity with round-the-clock bot operation",
    },
    {
      icon: Settings,
      title: "Customizable Parameters",
      description: "Fine-tune every aspect of your bot's behavior to match your strategy",
    },
    {
      icon: Brain,
      title: "Machine Learning",
      description: "Bots continuously learn and improve from market data and trading results",
    },
    {
      icon: Target,
      title: "Risk Management",
      description: "Built-in stop-loss, take-profit, and position sizing for capital protection",
    },
  ]

  return (
    <section className="py-20 px-4 relative">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border-blue-500/30">
            <Bot className="w-4 h-4 mr-2" />
            AI Trading Bots
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Intelligent Trading Bots for{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Every Strategy
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Choose from our collection of AI-powered trading bots, each designed for specific market conditions and
            trading styles
          </p>
        </div>

        {/* Bot Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {botTypes.map((bot, index) => (
            <Card
              key={index}
              className="bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 transition-all duration-300 transform hover:scale-105 group"
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-r ${bot.color} shadow-lg group-hover:shadow-xl transition-all duration-300`}
                  >
                    <bot.icon className="h-6 w-6 text-white" />
                  </div>
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/20">{bot.performance}</Badge>
                </div>
                <CardTitle className="text-white text-xl group-hover:text-blue-300 transition-colors">
                  {bot.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-gray-300 text-base leading-relaxed">{bot.description}</CardDescription>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-white">Key Features:</p>
                  <div className="flex flex-wrap gap-2">
                    {bot.features.map((feature, featureIndex) => (
                      <Badge key={featureIndex} variant="outline" className="text-xs border-gray-600 text-gray-300">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  <Play className="w-4 h-4 mr-2" />
                  Deploy Bot
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bot Features */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">Why Choose Our Trading Bots?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {botFeatures.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-gray-700/50 to-gray-600/50 mb-4 mx-auto w-fit group-hover:from-blue-600/50 group-hover:to-purple-600/50 transition-all duration-300">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-white font-semibold mb-2 group-hover:text-blue-300 transition-colors">
                  {feature.title}
                </h4>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">50+</div>
            <div className="text-gray-400">Trading Bot Templates</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">$2.5M+</div>
            <div className="text-gray-400">Total Volume Traded</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">85%</div>
            <div className="text-gray-400">Average Success Rate</div>
          </div>
        </div>
      </div>
    </section>
  )
}
