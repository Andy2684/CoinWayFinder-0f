"use client"

import { useRealtimePortfolio } from "@/hooks/use-realtime-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Eye, EyeOff, Wallet, PieChart } from "lucide-react"
import { useState } from "react"

export function PortfolioOverview() {
  const { portfolio, isConnected } = useRealtimePortfolio()
  const [hideBalance, setHideBalance] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? "+" : ""}${percent.toFixed(2)}%`
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold flex items-center">
            <Wallet className="w-5 h-5 mr-2" />
            Portfolio Overview
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant={isConnected ? "default" : "destructive"}>{isConnected ? "Live" : "Offline"}</Badge>
            <Button variant="ghost" size="sm" onClick={() => setHideBalance(!hideBalance)} className="h-8 w-8 p-0">
              {hideBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Value */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Portfolio Value</p>
              <div className="text-3xl font-bold">
                {hideBalance ? "••••••••" : formatCurrency(portfolio.totalValue)}
              </div>
              <div
                className={`text-sm flex items-center ${
                  portfolio.todayChangePercent >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {portfolio.todayChangePercent >= 0 ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                {hideBalance ? "••••" : formatCurrency(portfolio.todayChange)} (
                {hideBalance ? "••••" : formatPercent(portfolio.todayChangePercent)}) today
              </div>
            </div>

            {/* Portfolio Allocation */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Top Holdings</p>
              <div className="space-y-2">
                {portfolio.positions.slice(0, 3).map((position) => (
                  <div key={position.symbol} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-[#30D5C8]"></div>
                      <span className="text-sm font-medium">{position.symbol}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{hideBalance ? "••••" : formatCurrency(position.value)}</div>
                      <div className={`text-xs ${position.changePercent >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {hideBalance ? "••••" : formatPercent(position.changePercent)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Quick Stats</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Assets</span>
                  <span className="text-sm font-medium">{portfolio.positions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Best Performer</span>
                  <span className="text-sm font-medium text-green-600">
                    {
                      portfolio.positions.reduce((best, pos) => (pos.changePercent > best.changePercent ? pos : best))
                        .symbol
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Allocation</span>
                  <Button variant="ghost" size="sm" className="h-6 p-1">
                    <PieChart className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Positions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Your Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {portfolio.positions.map((position) => (
              <div
                key={position.symbol}
                className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-[#30D5C8]/10 flex items-center justify-center">
                    <span className="font-bold text-[#30D5C8]">{position.symbol[0]}</span>
                  </div>
                  <div>
                    <div className="font-semibold">{position.symbol}</div>
                    <div className="text-sm text-muted-foreground">
                      {hideBalance ? "••••" : position.quantity.toFixed(4)} {position.symbol}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-semibold">{hideBalance ? "••••••••" : formatCurrency(position.value)}</div>
                  <div
                    className={`text-sm flex items-center justify-end ${
                      position.changePercent >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {position.changePercent >= 0 ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {hideBalance ? "••••" : formatPercent(position.changePercent)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
