"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react"

interface ScreeningCriteria {
  priceChange24h?: { min?: number; max?: number }
  volume24h?: { min?: number; max?: number }
  marketCap?: { min?: number; max?: number }
  price?: { min?: number; max?: number }
  rsi?: { min?: number; max?: number }
  macd?: { signal?: "bullish" | "bearish" | "neutral" }
  movingAverage?: { period: number; position: "above" | "below" }
  volatility?: { min?: number; max?: number }
  exchanges?: string[]
  symbols?: string[]
}

interface ScreeningResult {
  symbol: string
  exchange: string
  price: number
  priceChange24h: number
  volume24h: number
  marketCap: number
  rsi: number
  macd: {
    value: number
    signal: number
    histogram: number
    trend: "bullish" | "bearish" | "neutral"
  }
  movingAverages: {
    ma20: number
    ma50: number
    ma200: number
  }
  volatility: number
  score: number
  alerts: string[]
  timestamp: number
}

export function RealTimeScreener() {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<ScreeningResult[]>([])
  const [criteria, setCriteria] = useState<ScreeningCriteria>({
    exchanges: ["binance", "bybit"],
    priceChange24h: { min: -50, max: 50 },
    volume24h: { min: 100000 },
    rsi: { min: 0, max: 100 },
  })
  const [selectedExchanges, setSelectedExchanges] = useState<string[]>(["binance", "bybit"])
  const [priceChangeRange, setPriceChangeRange] = useState([-10, 10])
  const [rsiRange, setRsiRange] = useState([30, 70])
  const [minVolume, setMinVolume] = useState(100000)

  const startScreening = async () => {
    try {
      const screenId = `screen_${Date.now()}`

      const response = await fetch("/api/screening", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          screenId,
          criteria: {
            ...criteria,
            exchanges: selectedExchanges,
            priceChange24h: { min: priceChangeRange[0], max: priceChangeRange[1] },
            rsi: { min: rsiRange[0], max: rsiRange[1] },
            volume24h: { min: minVolume },
          },
        }),
      })

      if (response.ok) {
        setIsRunning(true)
        // Start polling for results (in real app, use WebSocket)
        startPolling(screenId)
      }
    } catch (error) {
      console.error("Failed to start screening:", error)
    }
  }

  const stopScreening = async () => {
    try {
      await fetch("/api/screening?action=stop&screenId=current", {
        method: "GET",
      })
      setIsRunning(false)
    } catch (error) {
      console.error("Failed to stop screening:", error)
    }
  }

  const startPolling = (screenId: string) => {
    // Mock polling - in real app, use WebSocket
    const interval = setInterval(() => {
      if (!isRunning) {
        clearInterval(interval)
        return
      }

      // Generate mock results
      const mockResults: ScreeningResult[] = [
        {
          symbol: "BTCUSDT",
          exchange: "binance",
          price: 45000 + Math.random() * 5000,
          priceChange24h: (Math.random() - 0.5) * 20,
          volume24h: 1000000 + Math.random() * 5000000,
          marketCap: 850000000000,
          rsi: 30 + Math.random() * 40,
          macd: {
            value: Math.random() * 100,
            signal: Math.random() * 100,
            histogram: Math.random() * 50,
            trend: Math.random() > 0.5 ? "bullish" : "bearish",
          },
          movingAverages: {
            ma20: 44000,
            ma50: 43000,
            ma200: 42000,
          },
          volatility: Math.random() * 50,
          score: Math.random() * 100,
          alerts: ["High volume activity", "RSI oversold"],
          timestamp: Date.now(),
        },
        {
          symbol: "ETHUSDT",
          exchange: "bybit",
          price: 2500 + Math.random() * 500,
          priceChange24h: (Math.random() - 0.5) * 15,
          volume24h: 500000 + Math.random() * 2000000,
          marketCap: 300000000000,
          rsi: 40 + Math.random() * 30,
          macd: {
            value: Math.random() * 50,
            signal: Math.random() * 50,
            histogram: Math.random() * 25,
            trend: Math.random() > 0.3 ? "bullish" : "neutral",
          },
          movingAverages: {
            ma20: 2480,
            ma50: 2450,
            ma200: 2400,
          },
          volatility: Math.random() * 40,
          score: Math.random() * 80,
          alerts: ["MACD bullish crossover"],
          timestamp: Date.now(),
        },
      ]

      setResults(mockResults)
    }, 3000)
  }

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`
    return num.toFixed(2)
  }

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Real-Time Market Screener</span>
            <div className="flex items-center space-x-2">
              <Badge variant={isRunning ? "default" : "secondary"}>{isRunning ? "Running" : "Stopped"}</Badge>
              <Button
                onClick={isRunning ? stopScreening : startScreening}
                variant={isRunning ? "destructive" : "default"}
                size="sm"
              >
                {isRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isRunning ? "Stop" : "Start"}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="criteria" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="criteria">Screening Criteria</TabsTrigger>
              <TabsTrigger value="results">Results ({results.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="criteria" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Exchanges */}
                <div className="space-y-2">
                  <Label>Exchanges</Label>
                  <div className="space-y-2">
                    {["binance", "bybit", "coinbase", "kraken"].map((exchange) => (
                      <div key={exchange} className="flex items-center space-x-2">
                        <Switch
                          checked={selectedExchanges.includes(exchange)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedExchanges([...selectedExchanges, exchange])
                            } else {
                              setSelectedExchanges(selectedExchanges.filter((e) => e !== exchange))
                            }
                          }}
                        />
                        <Label className="capitalize">{exchange}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Change */}
                <div className="space-y-2">
                  <Label>Price Change 24h (%)</Label>
                  <div className="px-2">
                    <Slider
                      value={priceChangeRange}
                      onValueChange={setPriceChangeRange}
                      min={-50}
                      max={50}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>{priceChangeRange[0]}%</span>
                      <span>{priceChangeRange[1]}%</span>
                    </div>
                  </div>
                </div>

                {/* RSI Range */}
                <div className="space-y-2">
                  <Label>RSI Range</Label>
                  <div className="px-2">
                    <Slider
                      value={rsiRange}
                      onValueChange={setRsiRange}
                      min={0}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>{rsiRange[0]}</span>
                      <span>{rsiRange[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Minimum Volume */}
                <div className="space-y-2">
                  <Label>Minimum Volume (24h)</Label>
                  <Input
                    type="number"
                    value={minVolume}
                    onChange={(e) => setMinVolume(Number(e.target.value))}
                    placeholder="100000"
                  />
                </div>

                {/* MACD Signal */}
                <div className="space-y-2">
                  <Label>MACD Signal</Label>
                  <Select
                    value={criteria.macd?.signal || "any"}
                    onValueChange={(value) => {
                      setCriteria({
                        ...criteria,
                        macd: value === "any" ? undefined : { signal: value as any },
                      })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="bullish">Bullish</SelectItem>
                      <SelectItem value="bearish">Bearish</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Moving Average */}
                <div className="space-y-2">
                  <Label>Price vs Moving Average</Label>
                  <div className="space-y-2">
                    <Select
                      value={criteria.movingAverage?.period?.toString() || "20"}
                      onValueChange={(value) => {
                        setCriteria({
                          ...criteria,
                          movingAverage: {
                            period: Number(value),
                            position: criteria.movingAverage?.position || "above",
                          },
                        })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="20">MA20</SelectItem>
                        <SelectItem value="50">MA50</SelectItem>
                        <SelectItem value="200">MA200</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={criteria.movingAverage?.position || "above"}
                      onValueChange={(value) => {
                        setCriteria({
                          ...criteria,
                          movingAverage: {
                            period: criteria.movingAverage?.period || 20,
                            position: value as "above" | "below",
                          },
                        })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="above">Above MA</SelectItem>
                        <SelectItem value="below">Below MA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="results" className="space-y-4">
              {results.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {isRunning ? "Scanning markets..." : "Start screening to see results"}
                </div>
              ) : (
                <div className="space-y-4">
                  {results.map((result, index) => (
                    <Card key={`${result.symbol}-${result.exchange}-${index}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div>
                              <h3 className="font-semibold text-lg">{result.symbol}</h3>
                              <p className="text-sm text-muted-foreground capitalize">{result.exchange}</p>
                            </div>
                            <Badge variant="outline">Score: {result.score.toFixed(0)}</Badge>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">{formatPrice(result.price)}</div>
                            <div
                              className={`flex items-center ${result.priceChange24h >= 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              {result.priceChange24h >= 0 ? (
                                <TrendingUp className="w-4 h-4 mr-1" />
                              ) : (
                                <TrendingDown className="w-4 h-4 mr-1" />
                              )}
                              {result.priceChange24h >= 0 ? "+" : ""}
                              {result.priceChange24h.toFixed(2)}%
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Volume 24h</p>
                            <p className="font-medium">{formatNumber(result.volume24h)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Market Cap</p>
                            <p className="font-medium">{formatNumber(result.marketCap)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">RSI</p>
                            <p
                              className={`font-medium ${result.rsi < 30 ? "text-green-600" : result.rsi > 70 ? "text-red-600" : ""}`}
                            >
                              {result.rsi.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Volatility</p>
                            <p className="font-medium">{result.volatility.toFixed(2)}%</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">MA20</p>
                            <p
                              className={`font-medium ${result.price > result.movingAverages.ma20 ? "text-green-600" : "text-red-600"}`}
                            >
                              {formatPrice(result.movingAverages.ma20)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">MA50</p>
                            <p
                              className={`font-medium ${result.price > result.movingAverages.ma50 ? "text-green-600" : "text-red-600"}`}
                            >
                              {formatPrice(result.movingAverages.ma50)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">MACD</p>
                            <Badge
                              variant={
                                result.macd.trend === "bullish"
                                  ? "default"
                                  : result.macd.trend === "bearish"
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {result.macd.trend}
                            </Badge>
                          </div>
                        </div>

                        {result.alerts.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium flex items-center">
                              <AlertTriangle className="w-4 h-4 mr-1" />
                              Alerts
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {result.alerts.map((alert, alertIndex) => (
                                <Badge key={alertIndex} variant="outline" className="text-xs">
                                  {alert}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
