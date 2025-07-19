"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Activity, BarChart3, Target, AlertTriangle, Eye, Brain, Signal } from "lucide-react"

interface MarketData {
  symbol: string
  price: number
  change24h: number
  changePercent: number
  volume: number
  marketCap: number
  high24h: number
  low24h: number
  rsi: number
  macd: number
  sentiment: "bullish" | "bearish" | "neutral"
  support: number
  resistance: number
  volatility: number
}

interface TechnicalIndicator {
  name: string
  value: number
  signal: "buy" | "sell" | "hold"
  strength: number
  description: string
}

interface MarketSentiment {
  overall: "bullish" | "bearish" | "neutral"
  fearGreedIndex: number
  socialSentiment: number
  newsImpact: number
  technicalScore: number
}

export function MarketAnalysis() {
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT")
  const [marketData, setMarketData] = useState<Record<string, MarketData>>({})
  const [technicalIndicators, setTechnicalIndicators] = useState<TechnicalIndicator[]>([])
  const [marketSentiment, setMarketSentiment] = useState<MarketSentiment>({
    overall: "neutral",
    fearGreedIndex: 50,
    socialSentiment: 60,
    newsImpact: 45,
    technicalScore: 55,
  })
  const [isLive, setIsLive] = useState(true)

  const symbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "ADAUSDT", "SOLUSDT", "DOTUSDT"]

  // Generate mock market data
  const generateMarketData = (symbol: string): MarketData => {
    const basePrices: Record<string, number> = {
      BTCUSDT: 43000,
      ETHUSDT: 2600,
      BNBUSDT: 320,
      ADAUSDT: 0.45,
      SOLUSDT: 95,
      DOTUSDT: 7.2,
    }

    const basePrice = basePrices[symbol] || 100
    const changePercent = (Math.random() - 0.5) * 10
    const change24h = basePrice * (changePercent / 100)
    const price = basePrice + change24h

    return {
      symbol,
      price,
      change24h,
      changePercent,
      volume: Math.random() * 1000000000,
      marketCap: price * Math.random() * 20000000,
      high24h: price * (1 + Math.random() * 0.05),
      low24h: price * (1 - Math.random() * 0.05),
      rsi: 30 + Math.random() * 40,
      macd: (Math.random() - 0.5) * 100,
      sentiment: Math.random() > 0.6 ? "bullish" : Math.random() > 0.3 ? "neutral" : "bearish",
      support: price * (0.95 - Math.random() * 0.05),
      resistance: price * (1.05 + Math.random() * 0.05),
      volatility: Math.random() * 100,
    }
  }

  // Generate technical indicators
  const generateTechnicalIndicators = (): TechnicalIndicator[] => {
    return [
      {
        name: "RSI (14)",
        value: 30 + Math.random() * 40,
        signal: Math.random() > 0.5 ? "buy" : "sell",
        strength: Math.random() * 100,
        description: "Relative Strength Index indicates momentum",
      },
      {
        name: "MACD",
        value: (Math.random() - 0.5) * 100,
        signal: Math.random() > 0.5 ? "buy" : "hold",
        strength: Math.random() * 100,
        description: "Moving Average Convergence Divergence",
      },
      {
        name: "Bollinger Bands",
        value: Math.random() * 100,
        signal: Math.random() > 0.6 ? "buy" : "sell",
        strength: Math.random() * 100,
        description: "Price volatility and trend analysis",
      },
      {
        name: "Stochastic",
        value: Math.random() * 100,
        signal: Math.random() > 0.5 ? "hold" : "buy",
        strength: Math.random() * 100,
        description: "Momentum oscillator comparing closing price",
      },
      {
        name: "Williams %R",
        value: Math.random() * 100,
        signal: Math.random() > 0.5 ? "sell" : "buy",
        strength: Math.random() * 100,
        description: "Momentum indicator measuring overbought/oversold",
      },
    ]
  }

  // Update market data in real-time
  useEffect(() => {
    if (!isLive) return

    const updateData = () => {
      const newData: Record<string, MarketData> = {}
      symbols.forEach((symbol) => {
        newData[symbol] = generateMarketData(symbol)
      })
      setMarketData(newData)
      setTechnicalIndicators(generateTechnicalIndicators())

      // Update market sentiment
      setMarketSentiment({
        overall: Math.random() > 0.6 ? "bullish" : Math.random() > 0.3 ? "neutral" : "bearish",
        fearGreedIndex: 20 + Math.random() * 60,
        socialSentiment: 30 + Math.random() * 40,
        newsImpact: 20 + Math.random() * 60,
        technicalScore: 30 + Math.random() * 40,
      })
    }

    updateData()
    const interval = setInterval(updateData, 3000)

    return () => clearInterval(interval)
  }, [isLive])

  const currentData = marketData[selectedSymbol]

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "bullish":
        return "text-green-400"
      case "bearish":
        return "text-red-400"
      default:
        return "text-yellow-400"
    }
  }

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case "buy":
        return "text-green-400 bg-green-500/10"
      case "sell":
        return "text-red-400 bg-red-500/10"
      default:
        return "text-yellow-400 bg-yellow-500/10"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Live Market Analysis</h1>
          <p className="text-muted-foreground">Real-time technical analysis and market insights</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={isLive ? "default" : "outline"}
            onClick={() => setIsLive(!isLive)}
            className="flex items-center space-x-2"
          >
            <Activity className={`w-4 h-4 ${isLive ? "animate-pulse" : ""}`} />
            <span>{isLive ? "Live" : "Paused"}</span>
          </Button>
        </div>
      </div>

      {/* Symbol Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <span>Select Asset</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {symbols.map((symbol) => (
              <Button
                key={symbol}
                variant={selectedSymbol === symbol ? "default" : "outline"}
                onClick={() => setSelectedSymbol(symbol)}
                className="text-sm"
              >
                {symbol.replace("USDT", "")}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Price & Overview */}
      {currentData && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Current Price</span>
                <Badge variant="outline" className="text-xs">
                  {isLive ? "LIVE" : "PAUSED"}
                </Badge>
              </div>
              <div className="text-2xl font-bold">${currentData.price.toLocaleString()}</div>
              <div className="flex items-center space-x-1 mt-1">
                {currentData.changePercent > 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )}
                <span className={currentData.changePercent > 0 ? "text-green-400" : "text-red-400"}>
                  {currentData.changePercent > 0 ? "+" : ""}
                  {currentData.changePercent.toFixed(2)}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">24h Volume</span>
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">${(currentData.volume / 1000000).toFixed(1)}M</div>
              <div className="text-sm text-muted-foreground mt-1">High: ${currentData.high24h.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Market Sentiment</span>
                <Brain className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className={`text-2xl font-bold capitalize ${getSentimentColor(currentData.sentiment)}`}>
                {currentData.sentiment}
              </div>
              <div className="text-sm text-muted-foreground mt-1">RSI: {currentData.rsi.toFixed(1)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Volatility</span>
                <AlertTriangle className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">{currentData.volatility.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground mt-1">24h Range</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analysis Tabs */}
      <Tabs defaultValue="technical" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
          <TabsTrigger value="levels">Support/Resistance</TabsTrigger>
          <TabsTrigger value="signals">Signals</TabsTrigger>
        </TabsList>

        <TabsContent value="technical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Technical Indicators</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {technicalIndicators.map((indicator, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{indicator.name}</span>
                        <Badge className={getSignalColor(indicator.signal)}>{indicator.signal.toUpperCase()}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{indicator.description}</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">Value: {indicator.value.toFixed(2)}</span>
                        <div className="flex-1">
                          <Progress value={indicator.strength} className="h-2" />
                        </div>
                        <span className="text-sm text-muted-foreground">{indicator.strength.toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sentiment" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5" />
                  <span>Market Sentiment</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Fear & Greed Index</span>
                      <span className="text-sm font-medium">{marketSentiment.fearGreedIndex.toFixed(0)}</span>
                    </div>
                    <Progress value={marketSentiment.fearGreedIndex} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Social Sentiment</span>
                      <span className="text-sm font-medium">{marketSentiment.socialSentiment.toFixed(0)}</span>
                    </div>
                    <Progress value={marketSentiment.socialSentiment} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">News Impact</span>
                      <span className="text-sm font-medium">{marketSentiment.newsImpact.toFixed(0)}</span>
                    </div>
                    <Progress value={marketSentiment.newsImpact} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Technical Score</span>
                      <span className="text-sm font-medium">{marketSentiment.technicalScore.toFixed(0)}</span>
                    </div>
                    <Progress value={marketSentiment.technicalScore} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="w-5 h-5" />
                  <span>Market Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className={`text-3xl font-bold capitalize ${getSentimentColor(marketSentiment.overall)}`}>
                      {marketSentiment.overall}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Overall Market Sentiment</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold text-green-400">73%</div>
                      <div className="text-xs text-muted-foreground">Bullish Signals</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-red-400">27%</div>
                      <div className="text-xs text-muted-foreground">Bearish Signals</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="levels" className="space-y-4">
          {currentData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Support & Resistance Levels</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 border rounded-lg bg-green-500/5">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="font-medium">Support Level</span>
                      </div>
                      <div className="text-2xl font-bold text-green-400">${currentData.support.toLocaleString()}</div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Strong buying interest expected at this level
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg bg-red-500/5">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="font-medium">Resistance Level</span>
                      </div>
                      <div className="text-2xl font-bold text-red-400">${currentData.resistance.toLocaleString()}</div>
                      <p className="text-sm text-muted-foreground mt-1">Selling pressure expected at this level</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Key Levels Analysis</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between p-2 bg-muted/50 rounded">
                        <span>Current Price</span>
                        <span className="font-medium">${currentData.price.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-muted/50 rounded">
                        <span>Distance to Support</span>
                        <span className="text-green-400">
                          {(((currentData.price - currentData.support) / currentData.price) * 100).toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between p-2 bg-muted/50 rounded">
                        <span>Distance to Resistance</span>
                        <span className="text-red-400">
                          {(((currentData.resistance - currentData.price) / currentData.price) * 100).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="signals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Signal className="w-5 h-5" />
                <span>Trading Signals</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    type: "buy",
                    strength: "Strong",
                    indicator: "Golden Cross",
                    description: "50-day MA crossed above 200-day MA",
                    confidence: 85,
                    timeframe: "4h",
                  },
                  {
                    type: "sell",
                    strength: "Moderate",
                    indicator: "RSI Overbought",
                    description: "RSI above 70, potential reversal",
                    confidence: 65,
                    timeframe: "1h",
                  },
                  {
                    type: "buy",
                    strength: "Weak",
                    indicator: "Bullish Divergence",
                    description: "Price making lower lows, RSI making higher lows",
                    confidence: 45,
                    timeframe: "15m",
                  },
                ].map((signal, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={getSignalColor(signal.type)}>{signal.type.toUpperCase()}</Badge>
                        <span className="font-medium">{signal.indicator}</span>
                        <Badge variant="outline" className="text-xs">
                          {signal.timeframe}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{signal.description}</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">Confidence:</span>
                        <Progress value={signal.confidence} className="h-2 flex-1" />
                        <span className="text-sm font-medium">{signal.confidence}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
