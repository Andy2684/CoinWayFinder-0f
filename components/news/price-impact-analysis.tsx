"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Zap, BarChart3 } from "lucide-react"

export function PriceImpactAnalysis() {
  const impactData = [
    {
      news: "Bitcoin ETF Approval",
      coin: "BTC",
      impact: "high",
      priceChange: "+12.5%",
      volume: "+340%",
      timeframe: "1h",
      confidence: 95,
      correlation: 0.89,
    },
    {
      news: "Ethereum Staking Update",
      coin: "ETH",
      impact: "medium",
      priceChange: "+5.2%",
      volume: "+120%",
      timeframe: "2h",
      confidence: 78,
      correlation: 0.72,
    },
    {
      news: "DeFi Protocol Hack",
      coin: "UNI",
      impact: "high",
      priceChange: "-8.7%",
      volume: "+200%",
      timeframe: "30m",
      confidence: 92,
      correlation: -0.85,
    },
    {
      news: "Altcoin Season Signals",
      coin: "ALT",
      impact: "medium",
      priceChange: "+15.3%",
      volume: "+180%",
      timeframe: "4h",
      confidence: 67,
      correlation: 0.64,
    },
  ]

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-red-400/20 text-red-400"
      case "medium":
        return "bg-yellow-400/20 text-yellow-400"
      case "low":
        return "bg-green-400/20 text-green-400"
      default:
        return "bg-gray-400/20 text-gray-400"
    }
  }

  const getCorrelationStrength = (correlation: number) => {
    const abs = Math.abs(correlation)
    if (abs >= 0.8) return "Strong"
    if (abs >= 0.5) return "Moderate"
    return "Weak"
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Zap className="h-5 w-5 mr-2 text-yellow-400" />⚡ Price Impact Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Impact Overview */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 border border-gray-800 rounded-lg">
            <div className="text-red-400 font-bold text-lg">8</div>
            <div className="text-gray-400 text-xs">High Impact</div>
          </div>
          <div className="text-center p-3 border border-gray-800 rounded-lg">
            <div className="text-yellow-400 font-bold text-lg">15</div>
            <div className="text-gray-400 text-xs">Medium Impact</div>
          </div>
          <div className="text-center p-3 border border-gray-800 rounded-lg">
            <div className="text-green-400 font-bold text-lg">23</div>
            <div className="text-gray-400 text-xs">Low Impact</div>
          </div>
        </div>

        {/* Recent Impact Events */}
        <div className="space-y-3">
          {impactData.map((item, index) => (
            <div key={index} className="p-3 border border-gray-800 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Badge className={`text-xs ${getImpactColor(item.impact)}`}>{item.impact.toUpperCase()}</Badge>
                  <Badge variant="outline" className="text-xs">
                    {item.coin}
                  </Badge>
                  <span className="text-white text-sm font-medium">{item.news}</span>
                </div>
                <span className="text-gray-400 text-xs">{item.timeframe}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Price Change:</span>
                  <div
                    className={`flex items-center space-x-1 font-medium ${
                      item.priceChange.startsWith("+") ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {item.priceChange.startsWith("+") ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    <span>{item.priceChange}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Volume:</span>
                  <span className="text-blue-400 font-medium">{item.volume}</span>
                </div>
              </div>

              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Confidence:</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={item.confidence} className="w-16 h-1" />
                    <span className="text-white">{item.confidence}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Correlation:</span>
                  <div className="flex items-center space-x-1">
                    <span className={`font-medium ${item.correlation > 0 ? "text-green-400" : "text-red-400"}`}>
                      {item.correlation > 0 ? "+" : ""}
                      {item.correlation}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {getCorrelationStrength(item.correlation)}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Impact Metrics */}
        <div className="pt-4 border-t border-gray-800">
          <h4 className="text-white font-medium mb-3 flex items-center">
            <BarChart3 className="h-4 w-4 mr-1" />
            Impact Metrics
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Avg Response Time:</span>
              <span className="text-white font-medium">2.3 min</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Prediction Accuracy:</span>
              <span className="text-green-400 font-medium">87.2%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Market Efficiency:</span>
              <span className="text-blue-400 font-medium">High</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Volatility Index:</span>
              <span className="text-yellow-400 font-medium">Medium</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
