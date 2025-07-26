"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Activity, BarChart3 } from "lucide-react"

export function MarketSentiment() {
  const sentimentData = {
    overall: {
      score: 78,
      label: "Bullish",
      change: "+12%",
      trend: "up",
    },
    breakdown: {
      bullish: 45,
      bearish: 23,
      neutral: 32,
    },
    categories: [
      { name: "Bitcoin", sentiment: 82, change: "+5%" },
      { name: "Ethereum", sentiment: 76, change: "+3%" },
      { name: "DeFi", sentiment: 65, change: "-2%" },
      { name: "NFTs", sentiment: 48, change: "-8%" },
      { name: "Altcoins", sentiment: 71, change: "+7%" },
    ],
    indicators: [
      { name: "Fear & Greed Index", value: 74, status: "Greed" },
      { name: "Social Volume", value: 89, status: "High" },
      { name: "News Sentiment", value: 78, status: "Positive" },
      { name: "Price Action", value: 85, status: "Bullish" },
    ],
  }

  const getSentimentColor = (score: number) => {
    if (score >= 70) return "text-green-400"
    if (score >= 40) return "text-yellow-400"
    return "text-red-400"
  }

  const getSentimentBg = (score: number) => {
    if (score >= 70) return "bg-green-400/20"
    if (score >= 40) return "bg-yellow-400/20"
    return "bg-red-400/20"
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Activity className="h-5 w-5 mr-2 text-[#30D5C8]" />📊 Market Sentiment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Sentiment */}
        <div className="text-center p-4 border border-gray-800 rounded-lg">
          <div className={`text-3xl font-bold ${getSentimentColor(sentimentData.overall.score)}`}>
            {sentimentData.overall.score}%
          </div>
          <div className="text-white font-medium mt-1">{sentimentData.overall.label}</div>
          <div
            className={`flex items-center justify-center space-x-1 mt-2 text-sm ${
              sentimentData.overall.trend === "up" ? "text-green-400" : "text-red-400"
            }`}
          >
            {sentimentData.overall.trend === "up" ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>{sentimentData.overall.change} from yesterday</span>
          </div>
        </div>

        {/* Sentiment Breakdown */}
        <div>
          <h4 className="text-white font-medium mb-3">Sentiment Distribution</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <span className="text-gray-300 text-sm">Bullish</span>
              </div>
              <div className="flex items-center space-x-2">
                <Progress value={sentimentData.breakdown.bullish} className="w-20 h-2" />
                <span className="text-white font-medium text-sm">{sentimentData.breakdown.bullish}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <span className="text-gray-300 text-sm">Bearish</span>
              </div>
              <div className="flex items-center space-x-2">
                <Progress value={sentimentData.breakdown.bearish} className="w-20 h-2" />
                <span className="text-white font-medium text-sm">{sentimentData.breakdown.bearish}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                <span className="text-gray-300 text-sm">Neutral</span>
              </div>
              <div className="flex items-center space-x-2">
                <Progress value={sentimentData.breakdown.neutral} className="w-20 h-2" />
                <span className="text-white font-medium text-sm">{sentimentData.breakdown.neutral}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Sentiment */}
        <div>
          <h4 className="text-white font-medium mb-3">Category Sentiment</h4>
          <div className="space-y-2">
            {sentimentData.categories.map((category) => (
              <div key={category.name} className="flex items-center justify-between p-2 border border-gray-800 rounded">
                <span className="text-gray-300 text-sm">{category.name}</span>
                <div className="flex items-center space-x-2">
                  <div
                    className={`px-2 py-1 rounded text-xs font-medium ${getSentimentBg(category.sentiment)} ${getSentimentColor(category.sentiment)}`}
                  >
                    {category.sentiment}%
                  </div>
                  <span className={`text-xs ${category.change.startsWith("+") ? "text-green-400" : "text-red-400"}`}>
                    {category.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market Indicators */}
        <div>
          <h4 className="text-white font-medium mb-3 flex items-center">
            <BarChart3 className="h-4 w-4 mr-1" />
            Market Indicators
          </h4>
          <div className="space-y-2">
            {sentimentData.indicators.map((indicator) => (
              <div
                key={indicator.name}
                className="flex items-center justify-between p-2 border border-gray-800 rounded"
              >
                <span className="text-gray-300 text-sm">{indicator.name}</span>
                <div className="flex items-center space-x-2">
                  <Progress value={indicator.value} className="w-16 h-2" />
                  <Badge variant="outline" className="text-xs">
                    {indicator.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
