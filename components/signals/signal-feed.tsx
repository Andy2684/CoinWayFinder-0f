'use client'

import { useState, useEffect } from 'react'
import { SignalCard } from './signal-card'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, TrendingUp } from 'lucide-react'

interface Signal {
  id: string
  symbol: string
  type: 'BUY' | 'SELL'
  strategy: string
  exchange: string
  timeframe: string
  confidence: number
  entryPrice: number
  targetPrice: number
  stopLoss: number
  currentPrice: number
  pnl: number
  pnlPercentage: number
  progress: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  aiAnalysis: string
  createdAt: string
  status: 'ACTIVE' | 'COMPLETED' | 'STOPPED'
}

interface SignalFeedProps {
  filters: any
}

export function SignalFeed({ filters }: SignalFeedProps) {
  const [signals, setSignals] = useState<Signal[]>([])
  const [loading, setLoading] = useState(true)

  // Mock data for demonstration
  useEffect(() => {
    const mockSignals: Signal[] = [
      {
        id: '1',
        symbol: 'BTC/USDT',
        type: 'BUY',
        strategy: 'Trend Following',
        exchange: 'Binance',
        timeframe: '4H',
        confidence: 87,
        entryPrice: 43250,
        targetPrice: 45800,
        stopLoss: 41900,
        currentPrice: 44120,
        pnl: 870,
        pnlPercentage: 2.01,
        progress: 34,
        riskLevel: 'MEDIUM',
        aiAnalysis:
          'Strong bullish momentum with RSI showing oversold conditions. Volume profile indicates institutional accumulation.',
        createdAt: '2024-01-15T10:30:00Z',
        status: 'ACTIVE',
      },
      {
        id: '2',
        symbol: 'ETH/USDT',
        type: 'SELL',
        strategy: 'Mean Reversion',
        exchange: 'Bybit',
        timeframe: '1H',
        confidence: 92,
        entryPrice: 2580,
        targetPrice: 2420,
        stopLoss: 2650,
        currentPrice: 2510,
        pnl: 70,
        pnlPercentage: 2.71,
        progress: 44,
        riskLevel: 'LOW',
        aiAnalysis:
          'Overbought conditions on multiple timeframes. Bearish divergence detected on MACD.',
        createdAt: '2024-01-15T09:15:00Z',
        status: 'ACTIVE',
      },
      {
        id: '3',
        symbol: 'SOL/USDT',
        type: 'BUY',
        strategy: 'Breakout',
        exchange: 'KuCoin',
        timeframe: '15M',
        confidence: 78,
        entryPrice: 98.5,
        targetPrice: 105.2,
        stopLoss: 95.8,
        currentPrice: 101.3,
        pnl: 2.8,
        pnlPercentage: 2.84,
        progress: 42,
        riskLevel: 'HIGH',
        aiAnalysis:
          'Clean breakout above resistance with strong volume confirmation. Target confluence at 105.20.',
        createdAt: '2024-01-15T08:45:00Z',
        status: 'ACTIVE',
      },
      {
        id: '4',
        symbol: 'ADA/USDT',
        type: 'BUY',
        strategy: 'Support/Resistance',
        exchange: 'Binance',
        timeframe: '2H',
        confidence: 85,
        entryPrice: 0.485,
        targetPrice: 0.52,
        stopLoss: 0.465,
        currentPrice: 0.498,
        pnl: 0.013,
        pnlPercentage: 2.68,
        progress: 37,
        riskLevel: 'MEDIUM',
        aiAnalysis:
          'Bounce from key support level with bullish engulfing pattern. Good risk-reward ratio.',
        createdAt: '2024-01-15T07:20:00Z',
        status: 'ACTIVE',
      },
      {
        id: '5',
        symbol: 'MATIC/USDT',
        type: 'SELL',
        strategy: 'Trend Following',
        exchange: 'Bybit',
        timeframe: '30M',
        confidence: 81,
        entryPrice: 0.825,
        targetPrice: 0.78,
        stopLoss: 0.85,
        currentPrice: 0.805,
        pnl: 0.02,
        pnlPercentage: 2.42,
        progress: 44,
        riskLevel: 'MEDIUM',
        aiAnalysis:
          'Bearish trend continuation with lower highs and lower lows. Volume supporting the move.',
        createdAt: '2024-01-15T06:10:00Z',
        status: 'ACTIVE',
      },
      {
        id: '6',
        symbol: 'LINK/USDT',
        type: 'BUY',
        strategy: 'Momentum',
        exchange: 'Binance',
        timeframe: '1H',
        confidence: 89,
        entryPrice: 14.25,
        targetPrice: 15.8,
        stopLoss: 13.5,
        currentPrice: 14.95,
        pnl: 0.7,
        pnlPercentage: 4.91,
        progress: 45,
        riskLevel: 'LOW',
        aiAnalysis:
          'Strong momentum breakout with institutional buying pressure. Technical indicators aligned.',
        createdAt: '2024-01-15T05:30:00Z',
        status: 'ACTIVE',
      },
    ]

    setTimeout(() => {
      setSignals(mockSignals)
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <Card className="bg-[#1A1B23] border-gray-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#30D5C8]" />
            <span className="ml-2 text-gray-400">Loading signals...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (signals.length === 0) {
    return (
      <Card className="bg-[#1A1B23] border-gray-800">
        <CardContent className="p-6">
          <div className="text-center py-12">
            <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-400 mb-2">No signals found</h3>
            <p className="text-gray-500">Try adjusting your filters or create a new signal.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {signals.map((signal) => (
        <SignalCard key={signal.id} signal={signal} />
      ))}
    </div>
  )
}
