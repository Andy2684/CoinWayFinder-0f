"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Activity, TrendingUp, TrendingDown, Filter, ExternalLink } from "lucide-react"

interface Trade {
  id: string
  timestamp: string
  exchange: string
  pair: string
  side: "buy" | "sell"
  type: "market" | "limit" | "stop"
  amount: number
  price: number
  total: number
  fee: number
  status: "filled" | "partial" | "cancelled"
  strategy: string
  pnl?: number
}

export function TradeLogs() {
  const [filter, setFilter] = useState("all")
  const [trades] = useState<Trade[]>([
    {
      id: "1",
      timestamp: "2024-01-07 14:30:22",
      exchange: "Binance",
      pair: "BTC/USDT",
      side: "buy",
      type: "market",
      amount: 0.1,
      price: 67234.56,
      total: 6723.46,
      fee: 6.72,
      status: "filled",
      strategy: "DCA Pro",
      pnl: 234.56,
    },
    {
      id: "2",
      timestamp: "2024-01-07 13:45:18",
      exchange: "Bybit",
      pair: "ETH/USDT",
      side: "sell",
      type: "limit",
      amount: 2.5,
      price: 3456.78,
      total: 8641.95,
      fee: 8.64,
      status: "filled",
      strategy: "Grid Master",
      pnl: 156.78,
    },
    {
      id: "3",
      timestamp: "2024-01-07 12:15:45",
      exchange: "OKX",
      pair: "SOL/USDT",
      side: "buy",
      type: "stop",
      amount: 50,
      price: 156.78,
      total: 7839.0,
      fee: 7.84,
      status: "partial",
      strategy: "AI Trend",
      pnl: -45.67,
    },
    {
      id: "4",
      timestamp: "2024-01-07 11:30:12",
      exchange: "KuCoin",
      pair: "ADA/USDT",
      side: "sell",
      type: "market",
      amount: 1000,
      price: 0.4567,
      total: 456.7,
      fee: 0.46,
      status: "filled",
      strategy: "Scalper",
      pnl: 23.45,
    },
    {
      id: "5",
      timestamp: "2024-01-07 10:45:33",
      exchange: "Coinbase",
      pair: "MATIC/USDT",
      side: "buy",
      type: "limit",
      amount: 500,
      price: 0.8901,
      total: 445.05,
      fee: 2.23,
      status: "cancelled",
      strategy: "Manual",
    },
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "filled":
        return "bg-green-500/10 text-green-400"
      case "partial":
        return "bg-yellow-500/10 text-yellow-400"
      case "cancelled":
        return "bg-red-500/10 text-red-400"
      default:
        return "bg-gray-500/10 text-gray-400"
    }
  }

  const getSideColor = (side: string) => {
    return side === "buy" ? "text-green-400" : "text-red-400"
  }

  const filteredTrades = filter === "all" ? trades : trades.filter((trade) => trade.status === filter)

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center">
            <Activity className="w-5 h-5 mr-2 text-[#30D5C8]" />
            Trade Logs
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-24 bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="filled">Filled</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredTrades.map((trade) => (
            <div key={trade.id} className="p-3 bg-gray-800/30 rounded-lg border border-gray-700">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-white font-medium text-sm">{trade.pair}</h4>
                    <Badge className={getStatusColor(trade.status)}>{trade.status}</Badge>
                  </div>
                  <p className="text-gray-400 text-xs">
                    {trade.exchange} • {trade.strategy}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    {trade.side === "buy" ? (
                      <TrendingUp className="w-3 h-3 text-green-400" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-400" />
                    )}
                    <span className={`text-sm font-medium ${getSideColor(trade.side)}`}>
                      {trade.side.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{trade.type}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-2">
                <div>
                  <p className="text-xs text-gray-400">Amount</p>
                  <p className="text-sm text-white">{trade.amount}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Price</p>
                  <p className="text-sm text-white">${trade.price.toFixed(4)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Total</p>
                  <p className="text-sm text-white">${trade.total.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Fee</p>
                  <p className="text-sm text-white">${trade.fee.toFixed(2)}</p>
                </div>
              </div>

              {trade.pnl && (
                <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                  <span className="text-xs text-gray-400">P&L</span>
                  <span className={`text-sm font-medium ${trade.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>{trade.timestamp}</span>
                <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
