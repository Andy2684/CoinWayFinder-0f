"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import { SignalCard } from "./signal-card"

interface Signal {
  id: string
  symbol: string
  type: "BUY" | "SELL"
  strategy: string
  confidence: number
  entryPrice: number
  targetPrice: number
  stopLoss: number
  currentPrice: number
  pnl: number
  pnlPercentage: number
  status: "ACTIVE" | "COMPLETED" | "STOPPED"
  timeframe: string
  createdAt: string
  description: string
  aiAnalysis: string
  riskLevel: "LOW" | "MEDIUM" | "HIGH"
  exchange: string
}

interface SignalFeedProps {
  searchQuery: string
  filter: string
}

export function SignalFeed({ searchQuery, filter }: SignalFeedProps) {
  const [signals, setSignals] = useState<Signal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    const mockSignals: Signal[] = [
      {
        id: "1",
        symbol: "BTC/USDT",
        type: "BUY",
        strategy: "AI Trend Following",
        confidence: 87,
        entryPrice: 43250,
        targetPrice: 45800,
        stopLoss: 41900,
        currentPrice: 44100,
        pnl: 850,
        pnlPercentage: 1.97,
        status: "ACTIVE",
        timeframe: "4H",
        createdAt: "2024-01-10T10:30:00Z",
        description: "Strong bullish momentum detected with RSI oversold recovery",
        aiAnalysis:
          "Technical indicators show strong buy signal with 87% confidence. Volume surge confirms breakout above resistance.",
        riskLevel: "MEDIUM",
        exchange: "Binance",
      },
      {
        id: "2",
        symbol: "ETH/USDT",
        type: "SELL",
        strategy: "Mean Reversion",
        confidence: 92,
        entryPrice: 2650,
        targetPrice: 2480,
        stopLoss: 2720,
        currentPrice: 2580,
        pnl: 70,
        pnlPercentage: 2.64,
        status: "ACTIVE",
        timeframe: "1H",
        createdAt: "2024-01-10T09:15:00Z",
        description: "Overbought conditions with bearish divergence on RSI",
        aiAnalysis:
          "High probability short setup with strong resistance at current levels. Risk-reward ratio favors downside.",
        riskLevel: "LOW",
        exchange: "Bybit",
      },
      {
        id: "3",
        symbol: "SOL/USDT",
        type: "BUY",
        strategy: "Breakout Scalping",
        confidence: 78,
        entryPrice: 98.5,
        targetPrice: 102.3,
        stopLoss: 96.8,
        currentPrice: 101.2,
        pnl: 2.7,
        pnlPercentage: 2.74,
        status: "COMPLETED",
        timeframe: "15M",
        createdAt: "2024-01-10T08:45:00Z",
        description: "Clean breakout above key resistance with volume confirmation",
        aiAnalysis: "Successful breakout pattern with strong momentum. Target reached with minimal drawdown.",
        riskLevel: "HIGH",
        exchange: "KuCoin",
      },
      {
        id: "4",
        symbol: "ADA/USDT",
        type: "BUY",
        strategy: "DCA Accumulation",
        confidence: 65,
        entryPrice: 0.485,
        targetPrice: 0.52,
        stopLoss: 0.46,
        currentPrice: 0.492,
        pnl: 0.007,
        pnlPercentage: 1.44,
        status: "ACTIVE",
        timeframe: "1D",
        createdAt: "2024-01-09T16:20:00Z",
        description: "Long-term accumulation zone with strong support",
        aiAnalysis: "Dollar-cost averaging strategy in strong support zone. Low risk, moderate reward potential.",
        riskLevel: "LOW",
        exchange: "Coinbase Pro",
      },
      {
        id: "5",
        symbol: "MATIC/USDT",
        type: "SELL",
        strategy: "Grid Trading",
        confidence: 71,
        entryPrice: 0.825,
        targetPrice: 0.78,
        stopLoss: 0.85,
        currentPrice: 0.81,
        pnl: 0.015,
        pnlPercentage: 1.82,
        status: "ACTIVE",
        timeframe: "2H",
        createdAt: "2024-01-10T07:30:00Z",
        description: "Range-bound trading opportunity with clear levels",
        aiAnalysis: "Grid strategy optimal for current sideways market conditions. Multiple profit opportunities.",
        riskLevel: "MEDIUM",
        exchange: "OKX",
      },
    ]

    // Filter signals based on search and filter criteria
    let filteredSignals = mockSignals

    if (searchQuery) {
      filteredSignals = filteredSignals.filter(
        (signal) =>
          signal.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          signal.strategy.toLowerCase().includes(searchQuery.toLowerCase()) ||
          signal.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (filter !== "all") {
      filteredSignals = filteredSignals.filter((signal) => {
        switch (filter) {
          case "active":
            return signal.status === "ACTIVE"
          case "completed":
            return signal.status === "COMPLETED"
          case "high-confidence":
            return signal.confidence >= 80
          case "scalping":
            return signal.strategy.toLowerCase().includes("scalping")
          case "swing":
            return signal.timeframe === "4H" || signal.timeframe === "1D"
          default:
            return true
        }
      })
    }

    setSignals(filteredSignals)
    setLoading(false)
  }, [searchQuery, filter])

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {signals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No signals found</h3>
            <p className="text-muted-foreground text-center">
              Try adjusting your search criteria or filters to find more signals.
            </p>
          </CardContent>
        </Card>
      ) : (
        signals.map((signal) => <SignalCard key={signal.id} signal={signal} />)
      )}
    </div>
  )
}
