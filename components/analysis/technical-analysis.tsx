"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { TrendingUp, TrendingDown, Minus, RefreshCw } from "lucide-react"

interface TechnicalIndicator {
  name: string
  value: number
  signal: "buy" | "sell" | "neutral"
  description: string
}

interface PriceData {
  timestamp: string
  price: number
  rsi: number
  macd: number
  signal: number
  volume: number
}

export function TechnicalAnalysis() {
  const [selectedCrypto, setSelectedCrypto] = useState("BTC")
  const [timeframe, setTimeframe] = useState("1h")
  const [indicators, setIndicators] = useState<TechnicalIndicator[]>([])
  const [priceData, setPriceData] = useState<PriceData[]>([])
  const [loading, setLoading] = useState(false)

  const cryptos = [
    { value: "BTC", label: "Bitcoin (BTC)" },
    { value: "ETH", label: "Ethereum (ETH)" },
    { value: "ADA", label: "Cardano (ADA)" },
    { value: "SOL", label: "Solana (SOL)" },
    { value: "DOT", label: "Polkadot (DOT)" },
  ]

  const timeframes = [
    { value: "5m", label: "5 Minutes" },
    { value: "15m", label: "15 Minutes" },
    { value: "1h", label: "1 Hour" },
    { value: "4h", label: "4 Hours" },
    { value: "1d", label: "1 Day" },
  ]

  useEffect(() => {
    fetchTechnicalData()
  }, [selectedCrypto, timeframe])

  const fetchTechnicalData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/analysis/technical?symbol=${selectedCrypto}&timeframe=${timeframe}`)
      const data = await response.json()

      // Mock data for demonstration
      const mockIndicators: TechnicalIndicator[] = [
        { name: "RSI (14)", value: 65.4, signal: "neutral", description: "Relative Strength Index" },
        { name: "MACD", value: 0.0012, signal: "buy", description: "Moving Average Convergence Divergence" },
        { name: "SMA (20)", value: 42150.5, signal: "buy", description: "Simple Moving Average" },
        { name: "EMA (50)", value: 41980.2, signal: "buy", description: "Exponential Moving Average" },
        { name: "Bollinger Bands", value: 0.85, signal: "neutral", description: "Price relative to Bollinger Bands" },
        { name: "Stochastic", value: 72.3, signal: "sell", description: "Stochastic Oscillator" },
      ]

      const mockPriceData: PriceData[] = Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
        price: 42000 + Math.random() * 2000 - 1000,
        rsi: 30 + Math.random() * 40,
        macd: -0.002 + Math.random() * 0.004,
        signal: -0.001 + Math.random() * 0.002,
        volume: 1000000 + Math.random() * 5000000,
      }))

      setIndicators(mockIndicators)
      setPriceData(mockPriceData)
    } catch (error) {
      console.error("Error fetching technical data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case "buy":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "sell":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-yellow-500" />
    }
  }

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case "buy":
        return "bg-green-100 text-green-800 border-green-200"
      case "sell":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
    }
  }

  const overallSignal = () => {
    const buySignals = indicators.filter((i) => i.signal === "buy").length
    const sellSignals = indicators.filter((i) => i.signal === "sell").length

    if (buySignals > sellSignals) return "buy"
    if (sellSignals > buySignals) return "sell"
    return "neutral"
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Technical Analysis
            <Button variant="outline" size="sm" onClick={fetchTechnicalData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </CardTitle>
          <CardDescription>Advanced technical indicators and chart analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
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

            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent>
                {timeframes.map((tf) => (
                  <SelectItem key={tf.value} value={tf.value}>
                    {tf.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Price Chart</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={priceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" tickFormatter={(value) => new Date(value).toLocaleTimeString()} />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(value) => new Date(value).toLocaleString()}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, "Price"]}
                    />
                    <Area type="monotone" dataKey="price" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">RSI Indicator</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={priceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" tickFormatter={(value) => new Date(value).toLocaleTimeString()} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip
                      labelFormatter={(value) => new Date(value).toLocaleString()}
                      formatter={(value: number) => [value.toFixed(2), "RSI"]}
                    />
                    <Line type="monotone" dataKey="rsi" stroke="#ff7300" strokeWidth={2} />
                    <Line type="monotone" dataKey={() => 70} stroke="#ff0000" strokeDasharray="5 5" />
                    <Line type="monotone" dataKey={() => 30} stroke="#00ff00" strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Overall Signal
              {getSignalIcon(overallSignal())}
            </CardTitle>
            <CardDescription>Based on {indicators.length} technical indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Badge className={`text-lg px-4 py-2 ${getSignalColor(overallSignal())}`}>
                {overallSignal().toUpperCase()}
              </Badge>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Buy Signals</span>
                  <span>{indicators.filter((i) => i.signal === "buy").length}</span>
                </div>
                <Progress
                  value={(indicators.filter((i) => i.signal === "buy").length / indicators.length) * 100}
                  className="h-2"
                />

                <div className="flex justify-between text-sm">
                  <span>Sell Signals</span>
                  <span>{indicators.filter((i) => i.signal === "sell").length}</span>
                </div>
                <Progress
                  value={(indicators.filter((i) => i.signal === "sell").length / indicators.length) * 100}
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Technical Indicators</CardTitle>
            <CardDescription>Current values and signals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {indicators.map((indicator, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{indicator.name}</div>
                    <div className="text-sm text-muted-foreground">{indicator.description}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">
                      {typeof indicator.value === "number" && indicator.value > 1000
                        ? indicator.value.toFixed(2)
                        : indicator.value.toFixed(4)}
                    </span>
                    {getSignalIcon(indicator.signal)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
