"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Brain, TrendingUp, TrendingDown, AlertCircle, RefreshCw, Target, Zap } from "lucide-react"

interface AIInsight {
  title: string
  content: string
  confidence: number
  category: "bullish" | "bearish" | "neutral"
  timestamp: string
}

interface TradingSignal {
  symbol: string
  action: "BUY" | "SELL" | "HOLD"
  confidence: number
  targetPrice: number
  currentPrice: number
  reasoning: string
  timeframe: string
}

interface PricePrediction {
  symbol: string
  current: number
  predictions: {
    "1h": { price: number; change: number }
    "24h": { price: number; change: number }
    "7d": { price: number; change: number }
  }
  confidence: number
}

interface MarketStructure {
  trend: "bullish" | "bearish" | "sideways"
  strength: number
  support: number
  resistance: number
  keyLevels: number[]
  analysis: string
}

export function AIInsights() {
  const [selectedCrypto, setSelectedCrypto] = useState("BTC")
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [tradingSignals, setTradingSignals] = useState<TradingSignal[]>([])
  const [pricePredictions, setPricePredictions] = useState<PricePrediction[]>([])
  const [marketStructure, setMarketStructure] = useState<MarketStructure | null>(null)
  const [loading, setLoading] = useState(false)

  const cryptos = [
    { value: "BTC", label: "Bitcoin (BTC)" },
    { value: "ETH", label: "Ethereum (ETH)" },
    { value: "ADA", label: "Cardano (ADA)" },
    { value: "SOL", label: "Solana (SOL)" },
    { value: "DOT", label: "Polkadot (DOT)" },
  ]

  const fetchAIInsights = async () => {
    setLoading(true)
    try {
      // Mock data for demonstration
      const mockInsights: AIInsight[] = [
        {
          title: "Strong Bullish Momentum Detected",
          content:
            "Technical indicators show strong bullish momentum with RSI breaking above 70 and MACD showing positive divergence. Volume confirmation suggests sustained upward movement.",
          confidence: 85,
          category: "bullish",
          timestamp: "2 minutes ago",
        },
        {
          title: "Institutional Accumulation Pattern",
          content:
            "On-chain analysis reveals large wallet addresses accumulating positions over the past 48 hours. This typically precedes significant price movements.",
          confidence: 78,
          category: "bullish",
          timestamp: "15 minutes ago",
        },
        {
          title: "Resistance Level Approaching",
          content:
            "Price is approaching a critical resistance level at $44,200. Historical data shows this level has been tested 3 times in the past month.",
          confidence: 72,
          category: "neutral",
          timestamp: "1 hour ago",
        },
        {
          title: "Market Sentiment Shift",
          content:
            "Social sentiment analysis indicates a shift from fear to greed over the past 24 hours. Fear & Greed index moved from 35 to 58.",
          confidence: 68,
          category: "bullish",
          timestamp: "2 hours ago",
        },
      ]

      const mockSignals: TradingSignal[] = [
        {
          symbol: "BTC",
          action: "BUY",
          confidence: 82,
          targetPrice: 45500,
          currentPrice: 43200,
          reasoning: "Breakout above key resistance with high volume confirmation",
          timeframe: "4h",
        },
        {
          symbol: "ETH",
          action: "HOLD",
          confidence: 65,
          targetPrice: 2350,
          currentPrice: 2280,
          reasoning: "Consolidation phase, waiting for clear direction",
          timeframe: "1d",
        },
        {
          symbol: "ADA",
          action: "SELL",
          confidence: 71,
          targetPrice: 0.58,
          currentPrice: 0.65,
          reasoning: "Bearish divergence on RSI with declining volume",
          timeframe: "4h",
        },
      ]

      const mockPredictions: PricePrediction[] = [
        {
          symbol: "BTC",
          current: 43200,
          predictions: {
            "1h": { price: 43450, change: 0.58 },
            "24h": { price: 44800, change: 3.7 },
            "7d": { price: 46200, change: 6.9 },
          },
          confidence: 76,
        },
        {
          symbol: "ETH",
          current: 2280,
          predictions: {
            "1h": { price: 2285, change: 0.22 },
            "24h": { price: 2340, change: 2.6 },
            "7d": { price: 2420, change: 6.1 },
          },
          confidence: 71,
        },
      ]

      const mockStructure: MarketStructure = {
        trend: "bullish",
        strength: 78,
        support: 42800,
        resistance: 44200,
        keyLevels: [41500, 42800, 44200, 45500, 47000],
        analysis:
          "Market structure shows a clear bullish bias with higher highs and higher lows. Key support at $42,800 has held multiple tests, while resistance at $44,200 is the next major hurdle. A break above this level could target $45,500 and potentially $47,000.",
      }

      setInsights(mockInsights)
      setTradingSignals(mockSignals)
      setPricePredictions(mockPredictions)
      setMarketStructure(mockStructure)
    } catch (error) {
      console.error("Error fetching AI insights:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAIInsights()
  }, [selectedCrypto])

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600"
    if (confidence >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getConfidenceBg = (confidence: number) => {
    if (confidence >= 80) return "bg-green-100"
    if (confidence >= 60) return "bg-yellow-100"
    return "bg-red-100"
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "bullish":
        return "bg-green-100 text-green-800 border-green-200"
      case "bearish":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case "BUY":
        return "bg-green-100 text-green-800 border-green-200"
      case "SELL":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "bullish":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "bearish":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="h-8 w-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold">AI Market Insights</h2>
            <p className="text-muted-foreground">AI-powered analysis and predictions</p>
          </div>
        </div>
        <div className="flex gap-4">
          <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select cryptocurrency" />
            </SelectTrigger>
            <SelectContent>
              {cryptos.map((crypto) => (
                <SelectItem key={crypto.value} value={crypto.value}>
                  {crypto.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={fetchAIInsights} disabled={loading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              Latest AI Insights
            </CardTitle>
            <CardDescription>Real-time market analysis powered by AI</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-start justify-between">
                  <h4 className="font-medium">{insight.title}</h4>
                  <Badge variant="outline" className={getCategoryColor(insight.category)}>
                    {insight.category}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{insight.content}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Confidence:</span>
                    <Badge
                      variant="outline"
                      className={`${getConfidenceBg(insight.confidence)} ${getConfidenceColor(insight.confidence)} border-current`}
                    >
                      {insight.confidence}%
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">{insight.timestamp}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Trading Signals
            </CardTitle>
            <CardDescription>AI-generated trading recommendations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {tradingSignals.map((signal, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{signal.symbol}</span>
                    <Badge variant="outline" className={getActionColor(signal.action)}>
                      {signal.action}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">{signal.timeframe}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Current:</span>
                    <span className="ml-2 font-medium">${signal.currentPrice.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Target:</span>
                    <span className="ml-2 font-medium">${signal.targetPrice.toLocaleString()}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{signal.reasoning}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Confidence:</span>
                  <Progress value={signal.confidence} className="flex-1 h-2" />
                  <span className="text-xs font-medium">{signal.confidence}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Price Predictions</CardTitle>
            <CardDescription>AI-powered price forecasts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {pricePredictions.map((prediction, index) => (
              <div key={index} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{prediction.symbol}</h4>
                  <Badge
                    variant="outline"
                    className={`${getConfidenceBg(prediction.confidence)} ${getConfidenceColor(prediction.confidence)} border-current`}
                  >
                    {prediction.confidence}% confidence
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Current Price:{" "}
                  <span className="font-medium text-foreground">${prediction.current.toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(prediction.predictions).map(([timeframe, pred]) => (
                    <div key={timeframe} className="text-center p-3 border rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">{timeframe}</div>
                      <div className="font-medium">${pred.price.toLocaleString()}</div>
                      <div className={`text-xs ${pred.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {pred.change >= 0 ? "+" : ""}
                        {pred.change.toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {marketStructure && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Market Structure Analysis
                {getTrendIcon(marketStructure.trend)}
              </CardTitle>
              <CardDescription>Deep analysis of market structure and key levels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg text-center">
                  <div className="text-xs text-muted-foreground mb-1">Trend</div>
                  <div
                    className={`font-medium capitalize ${
                      marketStructure.trend === "bullish"
                        ? "text-green-600"
                        : marketStructure.trend === "bearish"
                          ? "text-red-600"
                          : "text-yellow-600"
                    }`}
                  >
                    {marketStructure.trend}
                  </div>
                </div>
                <div className="p-3 border rounded-lg text-center">
                  <div className="text-xs text-muted-foreground mb-1">Strength</div>
                  <div className="font-medium">{marketStructure.strength}%</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg text-center">
                  <div className="text-xs text-muted-foreground mb-1">Support</div>
                  <div className="font-medium text-green-600">${marketStructure.support.toLocaleString()}</div>
                </div>
                <div className="p-3 border rounded-lg text-center">
                  <div className="text-xs text-muted-foreground mb-1">Resistance</div>
                  <div className="font-medium text-red-600">${marketStructure.resistance.toLocaleString()}</div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-2">Key Levels</div>
                <div className="flex flex-wrap gap-2">
                  {marketStructure.keyLevels.map((level, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      ${level.toLocaleString()}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-2">Analysis</div>
                <p className="text-sm text-muted-foreground">{marketStructure.analysis}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
