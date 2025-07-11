"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, TrendingUp, TrendingDown, AlertTriangle, Target, Zap, RefreshCw } from "lucide-react"

interface AIInsight {
  id: string
  type: "bullish" | "bearish" | "neutral" | "warning"
  title: string
  description: string
  confidence: number
  timeframe: string
  asset: string
  impact: "high" | "medium" | "low"
  timestamp: string
}

interface TradingSignal {
  asset: string
  action: "buy" | "sell" | "hold"
  confidence: number
  targetPrice: number
  stopLoss: number
  reasoning: string
  timeframe: string
}

interface MarketPrediction {
  asset: string
  currentPrice: number
  predicted1h: number
  predicted24h: number
  predicted7d: number
  confidence: number
  trend: "up" | "down" | "sideways"
}

export function AiInsights() {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [signals, setSignals] = useState<TradingSignal[]>([])
  const [predictions, setPredictions] = useState<MarketPrediction[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchAIData()
  }, [])

  const fetchAIData = async () => {
    setLoading(true)
    try {
      // Mock data for demonstration
      const mockInsights: AIInsight[] = [
        {
          id: "1",
          type: "bullish",
          title: "Bitcoin Breaking Resistance",
          description:
            "BTC has successfully broken through the $41,500 resistance level with strong volume, indicating potential continuation to $45,000.",
          confidence: 85,
          timeframe: "4h",
          asset: "BTC",
          impact: "high",
          timestamp: "2 minutes ago",
        },
        {
          id: "2",
          type: "warning",
          title: "Ethereum Divergence Alert",
          description:
            "ETH price is showing bearish divergence with RSI while approaching key resistance. Watch for potential reversal.",
          confidence: 72,
          timeframe: "1h",
          asset: "ETH",
          impact: "medium",
          timestamp: "15 minutes ago",
        },
        {
          id: "3",
          type: "bullish",
          title: "Altcoin Season Indicators",
          description:
            "Multiple altcoins showing synchronized breakouts. Altcoin dominance increasing, suggesting rotation from BTC.",
          confidence: 78,
          timeframe: "1d",
          asset: "ALTS",
          impact: "high",
          timestamp: "1 hour ago",
        },
        {
          id: "4",
          type: "bearish",
          title: "Market Sentiment Cooling",
          description:
            "Social sentiment metrics showing decline in bullish mentions. Fear & Greed index dropping from extreme greed.",
          confidence: 68,
          timeframe: "24h",
          asset: "MARKET",
          impact: "medium",
          timestamp: "2 hours ago",
        },
      ]

      const mockSignals: TradingSignal[] = [
        {
          asset: "BTC",
          action: "buy",
          confidence: 82,
          targetPrice: 45000,
          stopLoss: 40000,
          reasoning: "Strong breakout above resistance with high volume. RSI reset from overbought levels.",
          timeframe: "4h-1d",
        },
        {
          asset: "ETH",
          action: "hold",
          confidence: 65,
          targetPrice: 2800,
          stopLoss: 2200,
          reasoning: "Mixed signals. Bullish fundamentals but technical showing weakness near resistance.",
          timeframe: "1h-4h",
        },
        {
          asset: "ADA",
          action: "buy",
          confidence: 75,
          targetPrice: 0.65,
          stopLoss: 0.45,
          reasoning: "Oversold bounce expected. Strong support holding and development activity increasing.",
          timeframe: "1d-1w",
        },
      ]

      const mockPredictions: MarketPrediction[] = [
        {
          asset: "BTC",
          currentPrice: 42000,
          predicted1h: 42150,
          predicted24h: 43200,
          predicted7d: 45500,
          confidence: 78,
          trend: "up",
        },
        {
          asset: "ETH",
          currentPrice: 2500,
          predicted1h: 2485,
          predicted24h: 2520,
          predicted7d: 2650,
          confidence: 72,
          trend: "sideways",
        },
        {
          asset: "SOL",
          currentPrice: 100,
          predicted1h: 102,
          predicted24h: 108,
          predicted7d: 125,
          confidence: 85,
          trend: "up",
        },
      ]

      setInsights(mockInsights)
      setSignals(mockSignals)
      setPredictions(mockPredictions)
    } catch (error) {
      console.error("Error fetching AI data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "bullish":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "bearish":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      default:
        return <Brain className="h-4 w-4 text-blue-600" />
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case "bullish":
        return "border-green-200 bg-green-50"
      case "bearish":
        return "border-red-200 bg-red-50"
      case "warning":
        return "border-yellow-200 bg-yellow-50"
      default:
        return "border-blue-200 bg-blue-50"
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case "buy":
        return "bg-green-100 text-green-800"
      case "sell":
        return "bg-red-100 text-red-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Target className="h-4 w-4 text-yellow-600" />
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              AI-Powered Market Insights
            </div>
            <Button variant="outline" size="sm" onClick={fetchAIData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </CardTitle>
          <CardDescription>
            Advanced AI analysis providing market insights, trading signals, and price predictions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-4 text-center">
                <Zap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-800">{insights.length}</div>
                <div className="text-sm text-purple-600">Active Insights</div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4 text-center">
                <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-800">{signals.length}</div>
                <div className="text-sm text-blue-600">Trading Signals</div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4 text-center">
                <Brain className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-800">
                  {Math.round(predictions.reduce((acc, p) => acc + p.confidence, 0) / predictions.length)}%
                </div>
                <div className="text-sm text-green-600">Avg Confidence</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList>
          <TabsTrigger value="insights">Market Insights</TabsTrigger>
          <TabsTrigger value="signals">Trading Signals</TabsTrigger>
          <TabsTrigger value="predictions">Price Predictions</TabsTrigger>
          <TabsTrigger value="analysis">Deep Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4">
            {insights.map((insight) => (
              <Card key={insight.id} className={`border ${getInsightColor(insight.type)}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getInsightIcon(insight.type)}
                      <h4 className="font-semibold">{insight.title}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          insight.impact === "high"
                            ? "destructive"
                            : insight.impact === "medium"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {insight.impact} impact
                      </Badge>
                      <Badge variant="outline">{insight.asset}</Badge>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                      <span>
                        Confidence: <strong>{insight.confidence}%</strong>
                      </span>
                      <span>
                        Timeframe: <strong>{insight.timeframe}</strong>
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">{insight.timestamp}</span>
                  </div>

                  <div className="mt-2">
                    <Progress value={insight.confidence} className="h-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="signals" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {signals.map((signal, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold">{signal.asset}</span>
                      </div>
                      <span className="font-semibold">{signal.asset}</span>
                    </div>
                    <Badge className={getActionColor(signal.action)}>{signal.action.toUpperCase()}</Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Target Price:</span>
                      <span className="font-medium">${signal.targetPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Stop Loss:</span>
                      <span className="font-medium">${signal.stopLoss.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Timeframe:</span>
                      <span className="font-medium">{signal.timeframe}</span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Confidence</span>
                      <span>{signal.confidence}%</span>
                    </div>
                    <Progress value={signal.confidence} className="h-2" />
                  </div>

                  <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                    <strong>Reasoning:</strong> {signal.reasoning}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <div className="grid gap-4">
            {predictions.map((prediction, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold">{prediction.asset}</span>
                      </div>
                      <span className="font-semibold">{prediction.asset}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(prediction.trend)}
                      <Badge variant="outline">{prediction.confidence}% confidence</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Current</div>
                      <div className="font-bold">${prediction.currentPrice.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">1 Hour</div>
                      <div
                        className={`font-bold ${prediction.predicted1h > prediction.currentPrice ? "text-green-600" : "text-red-600"}`}
                      >
                        ${prediction.predicted1h.toLocaleString()}
                      </div>
                      <div className="text-xs">
                        {(((prediction.predicted1h - prediction.currentPrice) / prediction.currentPrice) * 100).toFixed(
                          2,
                        )}
                        %
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">24 Hours</div>
                      <div
                        className={`font-bold ${prediction.predicted24h > prediction.currentPrice ? "text-green-600" : "text-red-600"}`}
                      >
                        ${prediction.predicted24h.toLocaleString()}
                      </div>
                      <div className="text-xs">
                        {(
                          ((prediction.predicted24h - prediction.currentPrice) / prediction.currentPrice) *
                          100
                        ).toFixed(2)}
                        %
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">7 Days</div>
                      <div
                        className={`font-bold ${prediction.predicted7d > prediction.currentPrice ? "text-green-600" : "text-red-600"}`}
                      >
                        ${prediction.predicted7d.toLocaleString()}
                      </div>
                      <div className="text-xs">
                        {(((prediction.predicted7d - prediction.currentPrice) / prediction.currentPrice) * 100).toFixed(
                          2,
                        )}
                        %
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Prediction Confidence</span>
                      <span>{prediction.confidence}%</span>
                    </div>
                    <Progress value={prediction.confidence} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deep Market Analysis</CardTitle>
              <CardDescription>Comprehensive AI-driven market analysis and recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Brain className="h-4 w-4 text-purple-600" />
                    Market Structure Analysis
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    The current market structure shows a bullish bias with Bitcoin leading the charge. Key resistance
                    levels have been broken with strong volume, indicating institutional participation.
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center p-2 bg-green-50 rounded">
                      <div className="font-bold text-green-800">Bullish</div>
                      <div className="text-green-600">Market Trend</div>
                    </div>
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <div className="font-bold text-blue-800">High</div>
                      <div className="text-blue-600">Volume</div>
                    </div>
                    <div className="text-center p-2 bg-purple-50 rounded">
                      <div className="font-bold text-purple-800">Strong</div>
                      <div className="text-purple-600">Momentum</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    Risk Assessment
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Current risk levels are moderate with some concerns around overextended positions in certain
                    altcoins. Recommended position sizing should account for increased volatility.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall Risk Level</span>
                      <Badge variant="default">Moderate</Badge>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-600" />
                    Trading Recommendations
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Consider increasing exposure to Layer 1 protocols on pullbacks</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span>Monitor DeFi tokens for potential rotation opportunities</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span>Reduce exposure to overextended meme coins</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
