"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, CheckCircle, XCircle, Clock, DollarSign, TrendingUp, AlertTriangle, Zap } from "lucide-react"

interface ExecutionStatus {
  signalId: string
  symbol: string
  type: "BUY" | "SELL"
  status: "PENDING" | "EXECUTING" | "EXECUTED" | "FAILED" | "CANCELLED"
  progress: number
  executionPrice?: number
  targetPrice: number
  stopLoss: number
  currentPrice: number
  pnl?: number
  pnlPercentage?: number
  exchange: string
  quantity: number
  fees?: number
  slippage?: number
  executionTime?: string
  error?: string
}

export function ExecutionMonitor() {
  const [executions, setExecutions] = useState<ExecutionStatus[]>([])
  const [isMonitoring, setIsMonitoring] = useState(true)

  useEffect(() => {
    // Mock execution data
    const mockExecutions: ExecutionStatus[] = [
      {
        signalId: "1",
        symbol: "BTC/USDT",
        type: "BUY",
        status: "EXECUTED",
        progress: 100,
        executionPrice: 43250,
        targetPrice: 45800,
        stopLoss: 41900,
        currentPrice: 44120,
        pnl: 870,
        pnlPercentage: 2.01,
        exchange: "Binance",
        quantity: 0.1,
        fees: 4.32,
        slippage: 0.05,
        executionTime: "2024-01-15T10:30:00Z",
      },
      {
        signalId: "2",
        symbol: "ETH/USDT",
        type: "SELL",
        status: "EXECUTING",
        progress: 65,
        targetPrice: 2420,
        stopLoss: 2650,
        currentPrice: 2580,
        exchange: "Bybit",
        quantity: 2.5,
      },
      {
        signalId: "3",
        symbol: "SOL/USDT",
        type: "BUY",
        status: "PENDING",
        progress: 0,
        targetPrice: 105.2,
        stopLoss: 95.8,
        currentPrice: 98.5,
        exchange: "OKX",
        quantity: 10,
      },
      {
        signalId: "4",
        symbol: "ADA/USDT",
        type: "SELL",
        status: "FAILED",
        progress: 0,
        targetPrice: 0.45,
        stopLoss: 0.52,
        currentPrice: 0.48,
        exchange: "KuCoin",
        quantity: 1000,
        error: "Insufficient balance",
      },
    ]

    setExecutions(mockExecutions)

    // Simulate real-time updates
    if (isMonitoring) {
      const interval = setInterval(() => {
        setExecutions((prev) =>
          prev.map((exec) => {
            if (exec.status === "EXECUTING") {
              const newProgress = Math.min(100, exec.progress + Math.random() * 20)
              if (newProgress >= 100) {
                return {
                  ...exec,
                  status: "EXECUTED",
                  progress: 100,
                  executionPrice: exec.currentPrice + (Math.random() - 0.5) * 10,
                  executionTime: new Date().toISOString(),
                  fees: exec.quantity * exec.currentPrice * 0.001,
                  slippage: Math.random() * 0.1,
                }
              }
              return { ...exec, progress: newProgress }
            }

            // Update current prices and P&L for executed positions
            if (exec.status === "EXECUTED" && exec.executionPrice) {
              const priceChange = (Math.random() - 0.5) * 50
              const newCurrentPrice = exec.currentPrice + priceChange
              const pnl =
                exec.type === "BUY"
                  ? (newCurrentPrice - exec.executionPrice) * exec.quantity
                  : (exec.executionPrice - newCurrentPrice) * exec.quantity
              const pnlPercentage = (pnl / (exec.executionPrice * exec.quantity)) * 100

              return {
                ...exec,
                currentPrice: newCurrentPrice,
                pnl,
                pnlPercentage,
              }
            }

            return exec
          }),
        )
      }, 2000)

      return () => clearInterval(interval)
    }
  }, [isMonitoring])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "EXECUTED":
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case "EXECUTING":
        return <Activity className="w-4 h-4 text-blue-400 animate-pulse" />
      case "PENDING":
        return <Clock className="w-4 h-4 text-yellow-400" />
      case "FAILED":
        return <XCircle className="w-4 h-4 text-red-400" />
      case "CANCELLED":
        return <XCircle className="w-4 h-4 text-gray-400" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "EXECUTED":
        return "text-green-400 bg-green-400/10"
      case "EXECUTING":
        return "text-blue-400 bg-blue-400/10"
      case "PENDING":
        return "text-yellow-400 bg-yellow-400/10"
      case "FAILED":
        return "text-red-400 bg-red-400/10"
      case "CANCELLED":
        return "text-gray-400 bg-gray-400/10"
      default:
        return "text-gray-400 bg-gray-400/10"
    }
  }

  const activeExecutions = executions.filter((e) => e.status === "EXECUTING" || e.status === "PENDING")
  const completedExecutions = executions.filter((e) => e.status === "EXECUTED")
  const failedExecutions = executions.filter((e) => e.status === "FAILED" || e.status === "CANCELLED")
  const totalPnL = completedExecutions.reduce((sum, exec) => sum + (exec.pnl || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">⚡ Execution Monitor</h2>
          <p className="text-gray-300">Real-time signal execution tracking</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge className={isMonitoring ? "text-green-400 bg-green-400/10" : "text-gray-400 bg-gray-400/10"}>
            {isMonitoring ? "Live" : "Paused"}
          </Badge>
          <Button variant="outline" onClick={() => setIsMonitoring(!isMonitoring)}>
            {isMonitoring ? "Pause" : "Resume"} Monitoring
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-[#1A1B23] border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Active Executions</p>
                <p className="text-2xl font-bold text-white">{activeExecutions.length}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1B23] border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-white">{completedExecutions.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1B23] border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total P&L</p>
                <p className={`text-2xl font-bold ${totalPnL >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1B23] border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Success Rate</p>
                <p className="text-2xl font-bold text-white">
                  {executions.length > 0 ? Math.round((completedExecutions.length / executions.length) * 100) : 0}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-[#30D5C8]" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="bg-[#1A1B23] border-gray-800">
          <TabsTrigger value="active">Active ({activeExecutions.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedExecutions.length})</TabsTrigger>
          <TabsTrigger value="failed">Failed ({failedExecutions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeExecutions.map((execution) => (
            <Card key={execution.signalId} className="bg-[#1A1B23] border-gray-800">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(execution.status)}
                    <div>
                      <h3 className="text-lg font-semibold text-white">{execution.symbol}</h3>
                      <p className="text-sm text-gray-400">
                        {execution.exchange} • {execution.type}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(execution.status)}>{execution.status}</Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Execution Progress */}
                {execution.status === "EXECUTING" && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Execution Progress</span>
                      <span className="text-white">{execution.progress.toFixed(0)}%</span>
                    </div>
                    <Progress value={execution.progress} className="h-2" />
                  </div>
                )}

                {/* Price Information */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Current Price</p>
                    <p className="text-sm font-medium text-white">${execution.currentPrice.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Target</p>
                    <p className="text-sm font-medium text-green-400">${execution.targetPrice.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Stop Loss</p>
                    <p className="text-sm font-medium text-red-400">${execution.stopLoss.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Quantity</p>
                    <p className="text-sm font-medium text-white">{execution.quantity}</p>
                  </div>
                </div>

                {/* Error Message */}
                {execution.error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <p className="text-sm text-red-400">{execution.error}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {activeExecutions.length === 0 && (
            <Card className="bg-[#1A1B23] border-gray-800">
              <CardContent className="p-8 text-center">
                <Zap className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No active executions</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedExecutions.map((execution) => (
            <Card key={execution.signalId} className="bg-[#1A1B23] border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <div>
                      <p className="font-medium text-white">
                        {execution.symbol} {execution.type}
                      </p>
                      <p className="text-xs text-gray-400">
                        {execution.exchange} •{" "}
                        {execution.executionTime && new Date(execution.executionTime).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${(execution.pnl || 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {(execution.pnl || 0) >= 0 ? "+" : ""}${(execution.pnl || 0).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {(execution.pnlPercentage || 0) >= 0 ? "+" : ""}
                      {(execution.pnlPercentage || 0).toFixed(2)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="failed" className="space-y-4">
          {failedExecutions.map((execution) => (
            <Card key={execution.signalId} className="bg-[#1A1B23] border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <XCircle className="w-5 h-5 text-red-400" />
                    <div>
                      <p className="font-medium text-white">
                        {execution.symbol} {execution.type}
                      </p>
                      <p className="text-xs text-gray-400">{execution.exchange}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="text-red-400 bg-red-400/10">{execution.status}</Badge>
                    {execution.error && <p className="text-xs text-red-400 mt-1">{execution.error}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
