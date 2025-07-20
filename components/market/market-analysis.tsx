"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, Activity, DollarSign, BarChart3, Play, Pause, RefreshCw } from "lucide-react"

interface MarketData {
  symbol: string
  name: string
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
  signal: "BUY" | "SELL" | "HOLD"
  strength: number
}

interface SentimentData {
  fearGreedIndex: number
  socialSentiment: number
  newsImpact: number
  technicalScore: number
}

interface SupportResistance {
  type: "support" | "resistance"
  level: number
  strength: number
  distance: number
}

const MOCK_ASSETS = [
  { symbol: "BTC", name: "Bitcoin" },
  { symbol: "ETH", name: "Ethereum" },
  { symbol: "BNB", name: "Binance Coin" },
  { symbol: "ADA", name: "Cardano" },
  { symbol: "SOL", name: "Solana" },
  { symbol: "DOT", name: "Polkadot" },
]

export function MarketAnalysis() {
  const [selectedAsset, setSelectedAsset] = useState("BTC")
  const [isLive, setIsLive] = useState(true)
  const [marketData, setMarketData] = useState<MarketData | null>(null)
  const [technicalIndicators, setTechnicalIndicators] = useState<TechnicalIndicator[]>([])
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null)
  const [supportResistance, setSupportResistance] = useState<SupportResistance[]>([])
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Generate mock data
  const generateMockData = () => {
    const basePrice = selectedAsset === "BTC" ? 45000 : selectedAsset === "ETH" ? 3000 : 1000
    const variation = (Math.random() - 0.5) * 0.1

    const mockMarketData: MarketData = {
      symbol: selectedAsset,
      name: MOCK_ASSETS.find((a) => a.symbol === selectedAsset)?.name || selectedAsset,
      price: basePrice * (1 + variation),
      change24h: (Math.random() - 0.5) * 10,
      volume24h: Math.random() * 1000000000,
      marketCap: Math.random() * 100000000000,
      high24h: basePrice * (1 + Math.abs(variation) + 0.02),
      low24h: basePrice * (1 + variation - 0.02),
    }

    const mockTechnicalIndicators: TechnicalIndicator[] = [
      {
        name: "RSI (14)",
        value: Math.random() * 100,
        signal: Math.random() > 0.6 ? "BUY" : Math.random() > 0.3 ? "SELL" : "HOLD",
        strength: Math.random() * 100,
      },
      {
        name: "MACD",
        value: (Math.random() - 0.5) * 100,
        signal: Math.random() > 0.6 ? "BUY" : Math.random() > 0.3 ? "SELL" : "HOLD",
        strength: Math.random() * 100,
      },
      {
        name: "Bollinger Bands",
        value: Math.random() * 100,
        signal: Math.random() > 0.6 ? "BUY" : Math.random() > 0.3 ? "SELL" : "HOLD",
        strength: Math.random() * 100,
      },
      {
        name: "Stochastic",
        value: Math.random() * 100,
        signal: Math.random() > 0.6 ? "BUY" : Math.random() > 0.3 ? "SELL" : "HOLD",
        strength: Math.random() * 100,
      },
      {
        name: "Williams %R",
        value: Math.random() * -100,
        signal: Math.random() > 0.6 ? "BUY" : Math.random() > 0.3 ? "SELL" : "HOLD",
        strength: Math.random() * 100,
      },
    ]

    const mockSentimentData: SentimentData = {
      fearGreedIndex: Math.random() * 100,
      socialSentiment: Math.random() * 100,
      newsImpact: Math.random() * 100,
      technicalScore: Math.random() * 100,
    }

    const mockSupportResistance: SupportResistance[] = [
      {
        type: "resistance",
        level: basePrice * 1.05,
        strength: Math.random() * 100,
        distance: 5,
      },
      {
        type: "support",
        level: basePrice * 0.95,
        strength: Math.random() * 100,
        distance: -5,
      },
      {
        type: "resistance",
        level: basePrice * 1.1,
        strength: Math.random() * 100,
        distance: 10,
      },
    ]

    setMarketData(mockMarketData)
    setTechnicalIndicators(mockTechnicalIndicators)
    setSentimentData(mockSentimentData)
    setSupportResistance(mockSupportResistance)
    setLastUpdate(new Date())
  }

  useEffect(() => {
    generateMockData()
  }, [selectedAsset])

  useEffect(() => {
    if (!isLive) return

    const interval = setInterval(() => {
      generateMockData()
    }, 3000) // Update every 3 seconds when live

    return () => clearInterval(interval)
  }, [isLive, selectedAsset])

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case "BUY":
        return "text-green-600 bg-green-100"
      case "SELL":
        return "text-red-600 bg-red-100"
      default:
        return "text-yellow-600 bg-yellow-100"
    }
  }

  const getSentimentColor = (value: number) => {
    if (value >= 70) return "text-green-600"
    if (value >= 30) return "text-yellow-600"
    return "text-red-600"
  }

  if (!marketData || !sentimentData) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={selectedAsset} onValueChange={setSelectedAsset}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MOCK_ASSETS.map((asset) => (
                <SelectItem key={asset.symbol} value={asset.symbol}>
                  {asset.name} ({asset.symbol})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant={isLive ? "default" : "outline"}
            size="sm"
            onClick={() => setIsLive(!isLive)}
            className="flex items-center gap-2"
          >
            {isLive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isLive ? "Live" : "Paused"}
          </Button>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <RefreshCw className="h-4 w-4" />
          Last update: {lastUpdate.toLocaleTimeString()}
        </div>
      </div>

      {/* Market Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${marketData.price.toLocaleString()}</div>
            <div
              className={`flex items-center text-xs ${marketData.change24h >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {marketData.change24h >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {marketData.change24h.toFixed(2)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">24h Volume</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(marketData.volume24h / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground">Trading volume</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Cap</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(marketData.marketCap / 1000000000).toFixed(1)}B</div>
            <p className="text-xs text-muted-foreground">Total market value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">24h Range</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              ${marketData.low24h.toLocaleString()} - ${marketData.high24h.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">High/Low range</p>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Tabs */}
      <Tabs defaultValue="technical" className="space-y-4">
        <TabsList>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
          <TabsTrigger value="levels">Levels</TabsTrigger>
          <TabsTrigger value="signals">Signals</TabsTrigger>
        </TabsList>

        <TabsContent value="technical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Technical Indicators</CardTitle>
              <CardDescription>Real-time technical analysis indicators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {technicalIndicators.map((indicator, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{indicator.name}</span>
                      <Badge className={getSignalColor(indicator.signal)}>{indicator.signal}</Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">Value: {indicator.value.toFixed(2)}</span>
                      <div className="flex-1">
                        <Progress value={indicator.strength} className="h-2" />
                      </div>
                      <span className="text-sm text-muted-foreground">{indicator.strength.toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sentiment" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Fear & Greed Index</CardTitle>
                <CardDescription>Market psychology indicator</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className={`text-4xl font-bold ${getSentimentColor(sentimentData.fearGreedIndex)}`}>
                    {sentimentData.fearGreedIndex.toFixed(0)}
                  </div>
                  <Progress value={sentimentData.fearGreedIndex} className="h-3" />
                  <p className="text-sm text-muted-foreground">
                    {sentimentData.fearGreedIndex >= 70
                      ? "Extreme Greed"
                      : sentimentData.fearGreedIndex >= 50
                        ? "Greed"
                        : sentimentData.fearGreedIndex >= 30
                          ? "Fear"
                          : "Extreme Fear"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Social Sentiment</CardTitle>
                <CardDescription>Social media sentiment analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className={`text-4xl font-bold ${getSentimentColor(sentimentData.socialSentiment)}`}>
                    {sentimentData.socialSentiment.toFixed(0)}%
                  </div>
                  <Progress value={sentimentData.socialSentiment} className="h-3" />
                  <p className="text-sm text-muted-foreground">
                    {sentimentData.socialSentiment >= 60
                      ? "Very Bullish"
                      : sentimentData.socialSentiment >= 40
                        ? "Bullish"
                        : "Bearish"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>News Impact</CardTitle>
                <CardDescription>Recent news sentiment impact</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className={`text-4xl font-bold ${getSentimentColor(sentimentData.newsImpact)}`}>
                    {sentimentData.newsImpact.toFixed(0)}%
                  </div>
                  <Progress value={sentimentData.newsImpact} className="h-3" />
                  <p className="text-sm text-muted-foreground">
                    {sentimentData.newsImpact >= 60
                      ? "Positive Impact"
                      : sentimentData.newsImpact >= 40
                        ? "Neutral"
                        : "Negative Impact"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Technical Score</CardTitle>
                <CardDescription>Combined technical analysis score</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className={`text-4xl font-bold ${getSentimentColor(sentimentData.technicalScore)}`}>
                    {sentimentData.technicalScore.toFixed(0)}%
                  </div>
                  <Progress value={sentimentData.technicalScore} className="h-3" />
                  <p className="text-sm text-muted-foreground">
                    {sentimentData.technicalScore >= 60
                      ? "Strong Buy"
                      : sentimentData.technicalScore >= 40
                        ? "Hold"
                        : "Strong Sell"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="levels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Support & Resistance Levels</CardTitle>
              <CardDescription>Key price levels to watch</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {supportResistance.map((level, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Badge variant={level.type === "resistance" ? "destructive" : "default"}>
                      {level.type.toUpperCase()}
                    </Badge>
                    <div>
                      <div className="font-medium">${level.level.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">
                        {level.distance > 0 ? "+" : ""}
                        {level.distance.toFixed(1)}% from current
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">Strength: {level.strength.toFixed(0)}%</div>
                    <Progress value={level.strength} className="h-2 w-20" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="signals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trading Signals</CardTitle>
              <CardDescription>AI-powered trading recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {technicalIndicators.slice(0, 3).map((indicator, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{indicator.name} Signal</span>
                      <Badge className={getSignalColor(indicator.signal)}>{indicator.signal}</Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">Timeframe: 1H</span>
                      <span className="text-sm text-muted-foreground">
                        Confidence: {indicator.strength.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
