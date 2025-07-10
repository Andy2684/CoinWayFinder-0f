"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Bot,
  Activity,
} from "lucide-react"

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

interface SignalCardProps {
  signal: Signal
}

export function SignalCard({ signal }: SignalCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isCopying, setIsCopying] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-blue-500"
      case "COMPLETED":
        return "bg-green-500"
      case "STOPPED":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "LOW":
        return "bg-green-100 text-green-800"
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800"
      case "HIGH":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const copySignal = async () => {
    setIsCopying(true)
    const signalText = `${signal.type} ${signal.symbol}
Entry: $${signal.entryPrice}
Target: $${signal.targetPrice}
Stop Loss: $${signal.stopLoss}
Strategy: ${signal.strategy}
Confidence: ${signal.confidence}%`

    await navigator.clipboard.writeText(signalText)
    setTimeout(() => setIsCopying(false), 2000)
  }

  const progressValue =
    signal.type === "BUY"
      ? ((signal.currentPrice - signal.entryPrice) / (signal.targetPrice - signal.entryPrice)) * 100
      : ((signal.entryPrice - signal.currentPrice) / (signal.entryPrice - signal.targetPrice)) * 100

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={`/placeholder.svg?height=40&width=40&text=${signal.symbol.split("/")[0]}`} />
              <AvatarFallback>{signal.symbol.split("/")[0]}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{signal.symbol}</CardTitle>
              <CardDescription className="flex items-center space-x-2">
                <Badge variant={signal.type === "BUY" ? "default" : "destructive"}>
                  {signal.type === "BUY" ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {signal.type}
                </Badge>
                <Badge variant="outline">{signal.timeframe}</Badge>
                <Badge className={getRiskColor(signal.riskLevel)}>{signal.riskLevel}</Badge>
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(signal.status)} variant="secondary">
              {signal.status === "ACTIVE" && <Activity className="h-3 w-3 mr-1" />}
              {signal.status === "COMPLETED" && <CheckCircle className="h-3 w-3 mr-1" />}
              {signal.status === "STOPPED" && <AlertTriangle className="h-3 w-3 mr-1" />}
              {signal.status}
            </Badge>
            <Button variant="ghost" size="sm" onClick={copySignal} disabled={isCopying}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Strategy and Confidence */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{signal.strategy}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Confidence:</span>
            <Badge variant="outline">{signal.confidence}%</Badge>
          </div>
        </div>

        {/* Price Information */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Entry Price</p>
            <p className="font-semibold">${signal.entryPrice.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Current Price</p>
            <p className="font-semibold">${signal.currentPrice.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Target</p>
            <p className="font-semibold text-green-600">${signal.targetPrice.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Stop Loss</p>
            <p className="font-semibold text-red-600">${signal.stopLoss.toLocaleString()}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress to Target</span>
            <span className={`font-semibold ${signal.pnlPercentage >= 0 ? "text-green-600" : "text-red-600"}`}>
              {signal.pnlPercentage >= 0 ? "+" : ""}
              {signal.pnlPercentage.toFixed(2)}%
            </span>
          </div>
          <Progress value={Math.max(0, Math.min(100, progressValue))} className="h-2" />
        </div>

        {/* P&L */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Unrealized P&L</p>
            <p className={`text-lg font-bold ${signal.pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
              {signal.pnl >= 0 ? "+" : ""}${signal.pnl.toFixed(2)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Exchange</p>
            <p className="font-medium">{signal.exchange}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground">{signal.description}</p>

        {/* Expandable AI Analysis */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <span className="text-sm font-medium">AI Analysis</span>
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2">
            <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <p className="text-sm">{signal.aiAnalysis}</p>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button size="sm" className="flex-1">
            <ExternalLink className="h-4 w-4 mr-2" />
            Trade Now
          </Button>
          <Button variant="outline" size="sm" className="flex-1 bg-transparent">
            <Target className="h-4 w-4 mr-2" />
            Set Alert
          </Button>
        </div>

        {/* Timestamp */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{new Date(signal.createdAt).toLocaleString()}</span>
          </div>
          <span>Signal ID: {signal.id}</span>
        </div>
      </CardContent>
    </Card>
  )
}
