"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, Activity, DollarSign, BarChart3, Brain, Target, Zap, Play, Pause } from "lucide-react"

interface MarketData {
  symbol: string
  price: number
  change24h: number
  volume24h: number
  marketCap: number
  high24h: number
  low24h: number
}

interface TechnicalIndicator {
  name: string
  value: number
  signal: "buy" | "sell" | "hold"
  strength: number
}

interface MarketSentiment {
  fearGreedIndex: number
  socialSentiment: number
  newsImpact: number
  technicalScore: number
}

export function MarketAnalysis() {
  const [selectedAsset, setSelectedAsset] = useState("BTC/USDT")
  const [isLive, setIsLive] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  const [marketData, setMarketData] = useState<MarketData>({
    symbol: "BTC/USDT",
    price: 43250.75,
    change24h: 2.34,
    volume24h: 28500000000,
    marketCap: 847000000000,
    high24h: 44100.5,
    low24h: 42800.25,
  })

  const [technicalIndicators, setTechnicalIndicators] = useState<TechnicalIndicator[]>([
    { name: "RSI (14)", value: 67.3, signal: "buy", strength: 75 },
    { name: "MACD", value: 245.8, signal: "buy", strength: 82 },
    { name: "Bollinger Bands", value: 0.78, signal: "hold", strength: 45 },
    { name: "Stochastic", value: 72.1, signal: "sell", strength: 68 },
    { name: "Williams %R", value: -28.4, signal: "buy", strength: 71 },
  ])

  const [sentiment, setSentiment] = useState<MarketSentiment>({
    fearGreedIndex: 73,
    socialSentiment: 68,
    newsImpact: 82,
    technicalScore: 76,
  })

  const [supportResistance] = useState([
    { level: 44500, type: "resistance", strength: 85, distance: 2.9 },
    { level: 43800, type: "resistance", strength: 72, distance: 1.3 },
    { level: 42900, type: "support", strength: 78, distance: -0.8 },
    { level: 42200, type: "support", strength: 91, distance: -2.4 },
  ])

  const [tradingSignals] = useState([
    {
      type: "buy",
      confidence: 78,
      timeframe: "4h",
      reason: "Bullish divergence detected",
      strength: "Strong",
    },
    {
      type: "hold",
      confidence: 65,
      timeframe: "1d",
      reason: "Consolidation phase",
      strength: "Medium",
    },
    {
      type: "buy",
      confidence: 82,
      timeframe: "15m",
      reason: "Breakout above resistance",
      strength: "Strong",
    },
  ])

  const assets = ["BTC/USDT", "ETH/USDT", "BNB/USDT", "ADA/USDT", "SOL/USDT", "DOT/USDT"]

  // Simulate live data updates
  useEffect(() => {
    if (!isLive) return

    const interval = setInterval(() => {
      setMarketData((prev) => ({
        ...prev,
        price: prev.price + (Math.random() - 0.5) * 100,
        change24h: prev.change24h + (Math.random() - 0.5) * 0.5,
      }))

      setTechnicalIndicators((prev) =>
        prev.map((indicator) => ({
          ...indicator,
          value: indicator.value + (Math.random() - 0.5) * 5,
          strength: Math.max(0, Math.min(100, indicator.strength + (Math.random() - 0.5) * 10)),
        })),
      )

      setLastUpdate(new Date())
    }, 3000)

    return () => clearInterval(interval)
  }, [isLive])

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case "buy":
        return "bg-green-500/10 text-green-400 border-green-500/20"
      case "sell":
        return "bg-red-500/10 text-red-400 border-red-500/20"
      case "hold":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Select value={selectedAsset} onValueChange={setSelectedAsset}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {assets.map((asset) => (
                <SelectItem key={asset} value={asset}>
                  {asset}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant={isLive ? "default" : "outline"} size="sm" onClick={() => setIsLive(!isLive)}>
            {isLive ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Live
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Paused
              </>
            )}
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">Last updated: {lastUpdate.toLocaleTimeString()}</div>
      </div>

      {/* Market Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="text-2xl font-bold">${marketData.price.toLocaleString()}</p>
                <p className={`text-sm ${marketData.change24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {marketData.change24h >= 0 ? "+" : ""}
                  {marketData.change24h.toFixed(2)}%
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">24h Volume</p>
                <p className="text-2xl font-bold">${(marketData.volume24h / 1e9).toFixed(2)}B</p>
                <p className="text-sm text-muted-foreground">Trading volume</p>
              </div>
              <Activity className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Market Cap</p>
                <p className="text-2xl font-bold">${(marketData.marketCap / 1e9).toFixed(0)}B</p>
                <p className="text-sm text-muted-foreground">Total value</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">24h Range</p>
                <p className="text-lg font-bold">
                  ${marketData.low24h.toLocaleString()} - ${marketData.high24h.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">High/Low</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Tabs */}
      <Tabs defaultValue="technical" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
          <TabsTrigger value="levels">Levels</TabsTrigger>
          <TabsTrigger value="signals">Signals</TabsTrigger>
        </TabsList>

        <TabsContent value="technical" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Technical Indicators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {technicalIndicators.map((indicator, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{indicator.name}</span>
                      <div className="flex items-center space-x-2">
                        <Badge className={getSignalColor(indicator.signal)}>{indicator.signal.toUpperCase()}</Badge>
                        <span className="text-sm text-muted-foreground">{indicator.value.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={indicator.strength} className="flex-1" />
                      <span className="text-xs text-muted-foreground w-12">{indicator.strength}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sentiment" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="w-5 h-5 mr-2" />
                  Market Sentiment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Fear & Greed Index</span>
                    <span className="font-medium">{sentiment.fearGreedIndex}/100</span>
                  </div>
                  <Progress value={sentiment.fearGreedIndex} className="h-3" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {sentiment.fearGreedIndex > 75
                      ? "Extreme Greed"
                      : sentiment.fearGreedIndex > 50
                        ? "Greed"
                        : sentiment.fearGreedIndex > 25
                          ? "Fear"
                          : "Extreme Fear"}
                  </p>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Social Sentiment</span>
                    <span className="font-medium">{sentiment.socialSentiment}%</span>
                  </div>
                  <Progress value={sentiment.socialSentiment} className="h-3" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>News Impact</span>
                    <span className="font-medium">{sentiment.newsImpact}%</span>
                  </div>
                  <Progress value={sentiment.newsImpact} className="h-3" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Technical Score</span>
                    <span className="font-medium">{sentiment.technicalScore}%</span>
                  </div>
                  <Progress value={sentiment.technicalScore} className="h-3" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Market Psychology</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-400 mb-2">{sentiment.fearGreedIndex}</div>
                    <Badge className="bg-green-500/10 text-green-400 border-green-500/20">GREED</Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">
                      Current market sentiment indicates strong bullish momentum with high confidence levels.
                    </p>
                    <p className="text-muted-foreground">
                      Social media sentiment is positive with increased trading activity.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="levels" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Support & Resistance Levels
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {supportResistance.map((level, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center space-x-3">
                      <Badge
                        className={
                          level.type === "resistance" ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"
                        }
                      >
                        {level.type.toUpperCase()}
                      </Badge>
                      <span className="font-medium">${level.level.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">Strength:</span>
                        <Progress value={level.strength} className="w-16 h-2" />
                        <span className="text-sm">{level.strength}%</span>
                      </div>
                      <span className={`text-sm ${level.distance >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {level.distance >= 0 ? "+" : ""}
                        {level.distance.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="signals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                AI Trading Signals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tradingSignals.map((signal, index) => (
                  <div key={index} className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge className={getSignalColor(signal.type)}>{signal.type.toUpperCase()}</Badge>
                        <span className="text-sm text-muted-foreground">{signal.timeframe}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{signal.confidence}%</span>
                        <Badge variant="outline">{signal.strength}</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{signal.reason}</p>
                    <Progress value={signal.confidence} className="mt-2 h-2" />
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
