"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
} from "recharts"
import { TrendingUp, TrendingDown, DollarSign, RefreshCw, AlertTriangle } from "lucide-react"

interface PortfolioHolding {
  symbol: string
  name: string
  amount: number
  value: number
  percentage: number
  change24h: number
  avgBuyPrice: number
  currentPrice: number
  pnl: number
  pnlPercentage: number
}

interface PortfolioMetrics {
  totalValue: number
  totalPnl: number
  totalPnlPercentage: number
  dayChange: number
  dayChangePercentage: number
  bestPerformer: string
  worstPerformer: string
}

interface RiskMetrics {
  volatility: number
  sharpeRatio: number
  maxDrawdown: number
  beta: number
  diversificationScore: number
}

export function PortfolioAnalysis() {
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([])
  const [metrics, setMetrics] = useState<PortfolioMetrics>({
    totalValue: 0,
    totalPnl: 0,
    totalPnlPercentage: 0,
    dayChange: 0,
    dayChangePercentage: 0,
    bestPerformer: "",
    worstPerformer: "",
  })
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics>({
    volatility: 0,
    sharpeRatio: 0,
    maxDrawdown: 0,
    beta: 0,
    diversificationScore: 0,
  })
  const [performanceData, setPerformanceData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchPortfolioData()
  }, [])

  const fetchPortfolioData = async () => {
    setLoading(true)
    try {
      // Mock data for demonstration
      const mockHoldings: PortfolioHolding[] = [
        {
          symbol: "BTC",
          name: "Bitcoin",
          amount: 0.5,
          value: 21000,
          percentage: 42,
          change24h: 2.5,
          avgBuyPrice: 40000,
          currentPrice: 42000,
          pnl: 1000,
          pnlPercentage: 5.0,
        },
        {
          symbol: "ETH",
          name: "Ethereum",
          amount: 8,
          value: 16000,
          percentage: 32,
          change24h: -1.2,
          avgBuyPrice: 1800,
          currentPrice: 2000,
          pnl: 1600,
          pnlPercentage: 11.1,
        },
        {
          symbol: "ADA",
          name: "Cardano",
          amount: 5000,
          value: 2500,
          percentage: 5,
          change24h: 3.8,
          avgBuyPrice: 0.45,
          currentPrice: 0.5,
          pnl: 250,
          pnlPercentage: 11.1,
        },
        {
          symbol: "SOL",
          name: "Solana",
          amount: 50,
          value: 5000,
          percentage: 10,
          change24h: -2.1,
          avgBuyPrice: 90,
          currentPrice: 100,
          pnl: 500,
          pnlPercentage: 11.1,
        },
        {
          symbol: "DOT",
          name: "Polkadot",
          amount: 500,
          value: 5500,
          percentage: 11,
          change24h: 1.5,
          avgBuyPrice: 10,
          currentPrice: 11,
          pnl: 500,
          pnlPercentage: 10.0,
        },
      ]

      const mockMetrics: PortfolioMetrics = {
        totalValue: 50000,
        totalPnl: 3850,
        totalPnlPercentage: 8.3,
        dayChange: 750,
        dayChangePercentage: 1.5,
        bestPerformer: "ETH",
        worstPerformer: "SOL",
      }

      const mockRiskMetrics: RiskMetrics = {
        volatility: 45.2,
        sharpeRatio: 1.8,
        maxDrawdown: -15.3,
        beta: 1.2,
        diversificationScore: 75,
      }

      const mockPerformanceData = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        value: 45000 + Math.random() * 10000,
        pnl: -2000 + Math.random() * 8000,
      }))

      setHoldings(mockHoldings)
      setMetrics(mockMetrics)
      setRiskMetrics(mockRiskMetrics)
      setPerformanceData(mockPerformanceData)
    } catch (error) {
      console.error("Error fetching portfolio data:", error)
    } finally {
      setLoading(false)
    }
  }

  const pieData = holdings.map((holding) => ({
    name: holding.symbol,
    value: holding.percentage,
    color: `hsl(${Math.random() * 360}, 70%, 50%)`,
  }))

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Portfolio Analysis
            <Button variant="outline" size="sm" onClick={fetchPortfolioData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </CardTitle>
          <CardDescription>Comprehensive analysis of your cryptocurrency portfolio</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Total Value</span>
                </div>
                <div className="text-2xl font-bold">${metrics.totalValue.toLocaleString()}</div>
                <div className={`text-sm ${metrics.dayChangePercentage >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {metrics.dayChangePercentage >= 0 ? "+" : ""}
                  {metrics.dayChangePercentage}% (${metrics.dayChange})
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Total P&L</span>
                </div>
                <div className={`text-2xl font-bold ${metrics.totalPnl >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {metrics.totalPnl >= 0 ? "+" : ""}${metrics.totalPnl.toLocaleString()}
                </div>
                <div className={`text-sm ${metrics.totalPnlPercentage >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {metrics.totalPnlPercentage >= 0 ? "+" : ""}
                  {metrics.totalPnlPercentage}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Best Performer</span>
                </div>
                <div className="text-2xl font-bold">{metrics.bestPerformer}</div>
                <div className="text-sm text-muted-foreground">24h winner</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium">Worst Performer</span>
                </div>
                <div className="text-2xl font-bold">{metrics.worstPerformer}</div>
                <div className="text-sm text-muted-foreground">24h loser</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="holdings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="holdings">Holdings</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          <TabsTrigger value="allocation">Allocation</TabsTrigger>
        </TabsList>

        <TabsContent value="holdings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Holdings</CardTitle>
              <CardDescription>Detailed breakdown of your cryptocurrency positions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {holdings.map((holding, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold">{holding.symbol}</span>
                        </div>
                        <div>
                          <div className="font-medium">{holding.name}</div>
                          <div className="text-sm text-muted-foreground">{holding.symbol}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">${holding.value.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">{holding.percentage}%</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Amount:</span>
                        <div className="font-medium">{holding.amount}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Avg Buy:</span>
                        <div className="font-medium">${holding.avgBuyPrice}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Current:</span>
                        <div className="font-medium">${holding.currentPrice}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">P&L:</span>
                        <div className={`font-medium ${holding.pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {holding.pnl >= 0 ? "+" : ""}${holding.pnl} ({holding.pnlPercentage}%)
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>24h Change</span>
                        <span className={holding.change24h >= 0 ? "text-green-600" : "text-red-600"}>
                          {holding.change24h >= 0 ? "+" : ""}
                          {holding.change24h}%
                        </span>
                      </div>
                      <Progress value={Math.abs(holding.change24h) * 10} className="h-1" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Performance</CardTitle>
              <CardDescription>Historical performance over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      name === "value" ? `$${value.toLocaleString()}` : `$${value.toFixed(0)}`,
                      name === "value" ? "Portfolio Value" : "P&L",
                    ]}
                  />
                  <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                  <Line type="monotone" dataKey="pnl" stroke="#82ca9d" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Metrics</CardTitle>
              <CardDescription>Portfolio risk analysis and key metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Portfolio Volatility</span>
                    <Badge variant={riskMetrics.volatility > 50 ? "destructive" : "default"}>
                      {riskMetrics.volatility}%
                    </Badge>
                  </div>
                  <Progress value={riskMetrics.volatility} className="h-2" />

                  <div className="flex justify-between items-center">
                    <span>Sharpe Ratio</span>
                    <Badge variant={riskMetrics.sharpeRatio > 1 ? "default" : "secondary"}>
                      {riskMetrics.sharpeRatio}
                    </Badge>
                  </div>
                  <Progress value={riskMetrics.sharpeRatio * 50} className="h-2" />

                  <div className="flex justify-between items-center">
                    <span>Max Drawdown</span>
                    <Badge variant="destructive">{riskMetrics.maxDrawdown}%</Badge>
                  </div>
                  <Progress value={Math.abs(riskMetrics.maxDrawdown)} className="h-2" />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Beta (vs BTC)</span>
                    <Badge variant={riskMetrics.beta > 1.5 ? "destructive" : "default"}>{riskMetrics.beta}</Badge>
                  </div>
                  <Progress value={riskMetrics.beta * 50} className="h-2" />

                  <div className="flex justify-between items-center">
                    <span>Diversification Score</span>
                    <Badge variant={riskMetrics.diversificationScore > 70 ? "default" : "secondary"}>
                      {riskMetrics.diversificationScore}/100
                    </Badge>
                  </div>
                  <Progress value={riskMetrics.diversificationScore} className="h-2" />

                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium text-yellow-800">Risk Warning</span>
                    </div>
                    <p className="text-sm text-yellow-700">
                      Your portfolio shows high volatility. Consider diversifying across different asset classes.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allocation" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Asset Allocation</CardTitle>
                <CardDescription>Current portfolio distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rebalancing Suggestions</CardTitle>
                <CardDescription>Optimize your portfolio allocation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="font-medium text-blue-800 mb-1">Reduce BTC Exposure</div>
                    <div className="text-sm text-blue-600">
                      Consider reducing BTC from 42% to 35% for better diversification
                    </div>
                  </div>

                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="font-medium text-green-800 mb-1">Increase Altcoin Allocation</div>
                    <div className="text-sm text-green-600">
                      Consider adding more mid-cap altcoins for growth potential
                    </div>
                  </div>

                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <div className="font-medium text-yellow-800 mb-1">Add Stablecoins</div>
                    <div className="text-sm text-yellow-600">
                      Consider 5-10% allocation to stablecoins for stability
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
