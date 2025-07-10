"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, TrendingUp, TrendingDown, Bot } from "lucide-react"

export function CreateSignalDialog() {
  const [open, setOpen] = useState(false)
  const [signalData, setSignalData] = useState({
    symbol: "",
    type: "BUY" as "BUY" | "SELL",
    strategy: "",
    entryPrice: "",
    targetPrice: "",
    stopLoss: "",
    timeframe: "",
    confidence: [75],
    riskLevel: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH",
    exchange: "",
    description: "",
    aiAnalysis: "",
  })

  const handleSubmit = () => {
    // Here you would typically send the data to your API
    console.log("Creating signal:", signalData)
    setOpen(false)
    // Reset form
    setSignalData({
      symbol: "",
      type: "BUY",
      strategy: "",
      entryPrice: "",
      targetPrice: "",
      stopLoss: "",
      timeframe: "",
      confidence: [75],
      riskLevel: "MEDIUM",
      exchange: "",
      description: "",
      aiAnalysis: "",
    })
  }

  const calculateRiskReward = () => {
    const entry = Number.parseFloat(signalData.entryPrice)
    const target = Number.parseFloat(signalData.targetPrice)
    const stop = Number.parseFloat(signalData.stopLoss)

    if (!entry || !target || !stop) return null

    const reward = signalData.type === "BUY" ? target - entry : entry - target
    const risk = signalData.type === "BUY" ? entry - stop : stop - entry

    if (risk <= 0) return null

    return (reward / risk).toFixed(2)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Signal
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Trading Signal</DialogTitle>
          <DialogDescription>Generate a new trading signal with AI analysis and risk management</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="symbol">Trading Pair</Label>
                  <Select
                    value={signalData.symbol}
                    onValueChange={(value) => setSignalData((prev) => ({ ...prev, symbol: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select pair" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BTC/USDT">BTC/USDT</SelectItem>
                      <SelectItem value="ETH/USDT">ETH/USDT</SelectItem>
                      <SelectItem value="SOL/USDT">SOL/USDT</SelectItem>
                      <SelectItem value="ADA/USDT">ADA/USDT</SelectItem>
                      <SelectItem value="MATIC/USDT">MATIC/USDT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Signal Type</Label>
                  <Select
                    value={signalData.type}
                    onValueChange={(value: "BUY" | "SELL") => setSignalData((prev) => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BUY">
                        <div className="flex items-center">
                          <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                          BUY
                        </div>
                      </SelectItem>
                      <SelectItem value="SELL">
                        <div className="flex items-center">
                          <TrendingDown className="h-4 w-4 mr-2 text-red-600" />
                          SELL
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="strategy">Strategy</Label>
                  <Select
                    value={signalData.strategy}
                    onValueChange={(value) => setSignalData((prev) => ({ ...prev, strategy: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select strategy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AI Trend Following">AI Trend Following</SelectItem>
                      <SelectItem value="Mean Reversion">Mean Reversion</SelectItem>
                      <SelectItem value="Breakout Scalping">Breakout Scalping</SelectItem>
                      <SelectItem value="Grid Trading">Grid Trading</SelectItem>
                      <SelectItem value="DCA Accumulation">DCA Accumulation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeframe">Timeframe</Label>
                  <Select
                    value={signalData.timeframe}
                    onValueChange={(value) => setSignalData((prev) => ({ ...prev, timeframe: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15M">15 Minutes</SelectItem>
                      <SelectItem value="1H">1 Hour</SelectItem>
                      <SelectItem value="4H">4 Hours</SelectItem>
                      <SelectItem value="1D">1 Day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="exchange">Exchange</Label>
                <Select
                  value={signalData.exchange}
                  onValueChange={(value) => setSignalData((prev) => ({ ...prev, exchange: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select exchange" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Binance">Binance</SelectItem>
                    <SelectItem value="Bybit">Bybit</SelectItem>
                    <SelectItem value="KuCoin">KuCoin</SelectItem>
                    <SelectItem value="OKX">OKX</SelectItem>
                    <SelectItem value="Coinbase Pro">Coinbase Pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Price Levels */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Price Levels</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="entry">Entry Price</Label>
                  <Input
                    id="entry"
                    type="number"
                    placeholder="0.00"
                    value={signalData.entryPrice}
                    onChange={(e) => setSignalData((prev) => ({ ...prev, entryPrice: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target">Target Price</Label>
                  <Input
                    id="target"
                    type="number"
                    placeholder="0.00"
                    value={signalData.targetPrice}
                    onChange={(e) => setSignalData((prev) => ({ ...prev, targetPrice: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stop">Stop Loss</Label>
                  <Input
                    id="stop"
                    type="number"
                    placeholder="0.00"
                    value={signalData.stopLoss}
                    onChange={(e) => setSignalData((prev) => ({ ...prev, stopLoss: e.target.value }))}
                  />
                </div>
              </div>

              {calculateRiskReward() && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Risk:Reward Ratio</span>
                    <Badge variant="outline">1:{calculateRiskReward()}</Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Risk & Confidence */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Confidence Level: {signalData.confidence[0]}%</Label>
                <Slider
                  value={signalData.confidence}
                  onValueChange={(value) => setSignalData((prev) => ({ ...prev, confidence: value }))}
                  max={100}
                  min={0}
                  step={5}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="risk">Risk Level</Label>
                <Select
                  value={signalData.riskLevel}
                  onValueChange={(value: "LOW" | "MEDIUM" | "HIGH") =>
                    setSignalData((prev) => ({ ...prev, riskLevel: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">
                      <Badge className="bg-green-100 text-green-800">LOW</Badge>
                    </SelectItem>
                    <SelectItem value="MEDIUM">
                      <Badge className="bg-yellow-100 text-yellow-800">MEDIUM</Badge>
                    </SelectItem>
                    <SelectItem value="HIGH">
                      <Badge className="bg-red-100 text-red-800">HIGH</Badge>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Signal Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the trading opportunity..."
                  value={signalData.description}
                  onChange={(e) => setSignalData((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ai-analysis">AI Analysis</Label>
                <Textarea
                  id="ai-analysis"
                  placeholder="Detailed AI-powered market analysis..."
                  value={signalData.aiAnalysis}
                  onChange={(e) => setSignalData((prev) => ({ ...prev, aiAnalysis: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            <Bot className="h-4 w-4 mr-2" />
            Create Signal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
