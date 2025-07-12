"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  BarChart3,
  Zap,
  Target,
  Repeat,
  Brain,
  ArrowUpDown,
  Layers,
} from "lucide-react";

export function BotStrategies() {
  const strategies = [
    {
      id: "dca",
      name: "DCA (Dollar Cost Averaging)",
      description:
        "Automatically buy crypto at regular intervals regardless of price",
      icon: Repeat,
      difficulty: "Beginner",
      riskLevel: "Low",
      timeframe: "Long-term",
      features: [
        "Fixed interval purchases",
        "Price averaging effect",
        "Emotion-free investing",
        "Customizable schedules",
      ],
      pros: [
        "Reduces volatility impact",
        "Simple to understand",
        "Great for beginners",
      ],
      cons: ["Slower profit potential", "Requires patience"],
      bestFor: "Long-term investors, beginners",
      minInvestment: "$100",
      avgReturn: "8-15% annually",
      color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
    {
      id: "grid",
      name: "Grid Trading",
      description:
        "Place buy and sell orders at predetermined intervals above and below current price",
      icon: BarChart3,
      difficulty: "Intermediate",
      riskLevel: "Medium",
      timeframe: "Short-Medium",
      features: [
        "Automated grid orders",
        "Profit from volatility",
        "Range-bound markets",
        "Dynamic rebalancing",
      ],
      pros: [
        "Profits from sideways markets",
        "Consistent small gains",
        "Works in volatility",
      ],
      cons: ["Struggles in strong trends", "Complex setup"],
      bestFor: "Sideways markets, experienced traders",
      minInvestment: "$500",
      avgReturn: "15-25% annually",
      color: "bg-[#30D5C8]/10 text-[#30D5C8] border-[#30D5C8]/20",
    },
    {
      id: "scalping",
      name: "Scalping Bot",
      description:
        "High-frequency trading capturing small price movements throughout the day",
      icon: Zap,
      difficulty: "Advanced",
      riskLevel: "High",
      timeframe: "Very Short",
      features: [
        "High-frequency trades",
        "Small profit margins",
        "Quick execution",
        "Technical indicators",
      ],
      pros: ["Quick profits", "Many opportunities", "Works in any market"],
      cons: ["High risk", "Requires monitoring", "Transaction fees"],
      bestFor: "Active traders, high-risk tolerance",
      minInvestment: "$1,000",
      avgReturn: "20-40% annually",
      color: "bg-red-500/10 text-red-400 border-red-500/20",
    },
    {
      id: "momentum",
      name: "Momentum Trading",
      description:
        "Follow strong price trends and ride the momentum for maximum gains",
      icon: TrendingUp,
      difficulty: "Intermediate",
      riskLevel: "Medium-High",
      timeframe: "Short-Medium",
      features: [
        "Trend following",
        "Momentum indicators",
        "Breakout detection",
        "Stop-loss protection",
      ],
      pros: [
        "Catches big moves",
        "Clear entry/exit signals",
        "Good risk/reward",
      ],
      cons: ["False breakouts", "Requires timing"],
      bestFor: "Trending markets, swing traders",
      minInvestment: "$300",
      avgReturn: "18-30% annually",
      color: "bg-green-500/10 text-green-400 border-green-500/20",
    },
    {
      id: "arbitrage",
      name: "Arbitrage Bot",
      description:
        "Exploit price differences between exchanges for risk-free profits",
      icon: ArrowUpDown,
      difficulty: "Advanced",
      riskLevel: "Low",
      timeframe: "Instant",
      features: [
        "Multi-exchange monitoring",
        "Price difference detection",
        "Instant execution",
        "Risk-free profits",
      ],
      pros: ["Low risk", "Consistent profits", "Market neutral"],
      cons: [
        "Requires multiple exchanges",
        "Small margins",
        "High competition",
      ],
      bestFor: "Large capital, technical users",
      minInvestment: "$2,000",
      avgReturn: "5-12% annually",
      color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    },
    {
      id: "mean-reversion",
      name: "Mean Reversion",
      description:
        "Buy when price is below average, sell when above - profit from price corrections",
      icon: Target,
      difficulty: "Intermediate",
      riskLevel: "Medium",
      timeframe: "Medium",
      features: [
        "Statistical analysis",
        "Overbought/oversold detection",
        "Price normalization",
        "Risk management",
      ],
      pros: [
        "Works in ranging markets",
        "Statistical edge",
        "Good risk control",
      ],
      cons: ["Struggles in trends", "Requires patience"],
      bestFor: "Range-bound markets, patient traders",
      minInvestment: "$400",
      avgReturn: "12-20% annually",
      color: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    },
    {
      id: "ai-adaptive",
      name: "AI Adaptive Strategy",
      description:
        "Machine learning algorithm that adapts to market conditions automatically",
      icon: Brain,
      difficulty: "Advanced",
      riskLevel: "Medium",
      timeframe: "Adaptive",
      features: [
        "Machine learning",
        "Market adaptation",
        "Pattern recognition",
        "Self-optimization",
      ],
      pros: ["Adapts to markets", "Continuous learning", "Advanced technology"],
      cons: ["Black box", "Requires trust", "Complex"],
      bestFor: "Tech-savvy traders, all markets",
      minInvestment: "$1,500",
      avgReturn: "25-45% annually",
      color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    },
    {
      id: "portfolio-rebalancing",
      name: "Portfolio Rebalancing",
      description:
        "Automatically maintain target allocation across multiple cryptocurrencies",
      icon: Layers,
      difficulty: "Beginner",
      riskLevel: "Low-Medium",
      timeframe: "Long-term",
      features: [
        "Multi-asset management",
        "Automatic rebalancing",
        "Target allocation",
        "Diversification",
      ],
      pros: ["Diversification", "Risk reduction", "Passive management"],
      cons: ["Lower returns", "Complexity with many assets"],
      bestFor: "Portfolio management, risk-averse investors",
      minInvestment: "$800",
      avgReturn: "10-18% annually",
      color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    },
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low":
        return "bg-green-500/10 text-green-400";
      case "Medium":
        return "bg-yellow-500/10 text-yellow-400";
      case "Medium-High":
        return "bg-orange-500/10 text-orange-400";
      case "High":
        return "bg-red-500/10 text-red-400";
      default:
        return "bg-gray-500/10 text-gray-400";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-500/10 text-green-400";
      case "Intermediate":
        return "bg-yellow-500/10 text-yellow-400";
      case "Advanced":
        return "bg-red-500/10 text-red-400";
      default:
        return "bg-gray-500/10 text-gray-400";
    }
  };

  return (
    <section className="mb-12">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          🎯 Trading Strategies
        </h2>
        <p className="text-gray-300">
          Choose from our proven algorithmic trading strategies
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {strategies.map((strategy) => (
          <Card
            key={strategy.id}
            className="bg-gray-900/50 border-gray-800 hover:border-[#30D5C8]/50 transition-colors"
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${strategy.color}`}
                  >
                    <strategy.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg">
                      {strategy.name}
                    </CardTitle>
                    <p className="text-gray-400 text-sm mt-1">
                      {strategy.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                <Badge className={getDifficultyColor(strategy.difficulty)}>
                  {strategy.difficulty}
                </Badge>
                <Badge className={getRiskColor(strategy.riskLevel)}>
                  {strategy.riskLevel} Risk
                </Badge>
                <Badge
                  variant="outline"
                  className="border-gray-600 text-gray-300"
                >
                  {strategy.timeframe}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Min Investment</p>
                  <p className="text-sm font-semibold text-white">
                    {strategy.minInvestment}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Avg Return</p>
                  <p className="text-sm font-semibold text-[#30D5C8]">
                    {strategy.avgReturn}
                  </p>
                </div>
              </div>

              {/* Features */}
              <div>
                <p className="text-sm font-medium text-white mb-2">
                  Key Features
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {strategy.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center text-xs text-gray-300"
                    >
                      <div className="w-1 h-1 bg-[#30D5C8] rounded-full mr-2"></div>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              {/* Pros & Cons */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-green-400 mb-2">
                    ✅ Pros
                  </p>
                  <ul className="space-y-1">
                    {strategy.pros.map((pro, index) => (
                      <li key={index} className="text-xs text-gray-300">
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-medium text-red-400 mb-2">
                    ❌ Cons
                  </p>
                  <ul className="space-y-1">
                    {strategy.cons.map((con, index) => (
                      <li key={index} className="text-xs text-gray-300">
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Best For */}
              <div>
                <p className="text-xs font-medium text-[#30D5C8] mb-1">
                  Best For
                </p>
                <p className="text-xs text-gray-300">{strategy.bestFor}</p>
              </div>

              {/* Action Button */}
              <Button className="w-full bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-[#191A1E] font-semibold">
                Create {strategy.name} Bot
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
