"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Plus, Bot, Zap } from "lucide-react"
import { toast } from "sonner"
import { AIRiskCheck } from "./ai-risk-check"

interface CreateBotDialogProps {
  userId: string
  onBotCreated: () => void
}

interface BotConfig {
  name: string
  exchange: string
  strategy: string
  symbol: string
  apiKey: string
  secretKey: string
  passphrase?: string
  investment: number
  riskLevel: number
  stopLoss: number
  takeProfit: number
  leverage: number
  dcaInterval?: string
  aiRecommendations: boolean
  runtime: {
    type: "time" | "profit"
    value: number
  }
  parameters: Record<string, any>
}

const EXCHANGES = [
  { id: "binance", name: "Binance", requiresPassphrase: false },
  { id: "bybit", name: "Bybit", requiresPassphrase: false },
  { id: "kucoin", name: "KuCoin", requiresPassphrase: true },
  { id: "okx", name: "OKX", requiresPassphrase: true },
  { id: "coinbase", name: "Coinbase Pro", requiresPassphrase: true },
  { id: "bitget", name: "Bitget", requiresPassphrase: false },
  { id: "gateio", name: "Gate.io", requiresPassphrase: false },
]

const STRATEGIES = [
  {
    id: "dca",
    name: "DCA (Dollar Cost Averaging)",
    description: "Automated periodic purchases with price deviation checks",
    riskLevel: "Low",
    minPlan: "free",
  },
  {
    id: "grid",
    name: "Grid Trading",
    description: "Multiple buy/sell orders at different price levels",
    riskLevel: "Medium",
    minPlan: "basic",
  },
  {
    id: "scalping",
    name: "Scalping",
    description: "High-frequency trading with technical indicators",
    riskLevel: "High",
    minPlan: "basic",
  },
  {
    id: "long-short",
    name: "Long/Short AI",
    description: "Leveraged positions with AI market analysis",
    riskLevel: "High",
    minPlan: "premium",
  },
  {
    id: "trend-following",
    name: "Trend Following",
    description: "Moving average crossover with ATR-based stops",
    riskLevel: "Medium",
    minPlan: "premium",
  },
  {
    id: "arbitrage",
    name: "Arbitrage",
    description: "Cross-exchange price difference exploitation",
    riskLevel: "Low",
    minPlan: "enterprise",
  },
]

const POPULAR_SYMBOLS = [
  "BTCUSDT",
  "ETHUSDT",
  "BNBUSDT",
  "ADAUSDT",
  "SOLUSDT",
  "XRPUSDT",
  "DOTUSDT",
  "DOGEUSDT",
  "AVAXUSDT",
  "MATICUSDT",
]

export function CreateBotDialog({ userId, onBotCreated }: CreateBotDialogProps) {
  const [open, setOpen] = useState(false)
  const [currentTab, setCurrentTab] = useState("strategy")
  const [creating, setCreating] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)
  const [connectionTested, setConnectionTested] = useState(false)
  const [riskAnalysisResult, setRiskAnalysisResult] = useState<any>(null)

  const [config, setConfig] = useState<BotConfig>({
    name: "",
    exchange: "",
    strategy: "",
    symbol: "BTCUSDT",
    apiKey: "",
    secretKey: "",
    passphrase: "",
    investment: 100,
    riskLevel: 5,
    stopLoss: 5,
    takeProfit: 10,
    leverage: 1,
    dcaInterval: "1h",
    aiRecommendations: true,
    runtime: {
      type: "time",
      value: 24,
    },
    parameters: {},
  })

  const selectedExchange = EXCHANGES.find((e) => e.id === config.exchange)
  const selectedStrategy = STRATEGIES.find((s) => s.id === config.strategy)

  const testConnection = async () => {
    if (!config.apiKey || !config.secretKey || !config.exchange) {
      toast.error("Please fill in all API credentials")
      return
    }

    setTestingConnection(true)

    try {
      const response = await fetch("/api/test-connection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          exchange: config.exchange,
          apiKey: config.apiKey,
          secretKey: config.secretKey,
          passphrase: config.passphrase,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setConnectionTested(true)
        toast.success("Connection successful!")
      } else {
        toast.error(result.error || "Connection failed")
      }
    } catch (error) {
      console.error("Connection test failed:", error)
      toast.error("Connection test failed")
    } finally {
      setTestingConnection(false)
    }
  }

  const createBot = async () => {
    if (!connectionTested) {
      toast.error("Please test your API connection first")
      return
    }

    if (riskAnalysisResult?.shouldBlock) {
      toast.error("Cannot create bot - risk analysis blocked this configuration")
      return
    }

    setCreating(true)

    try {
      const response = await fetch("/api/bots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          ...config,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Bot created successfully!")
        setOpen(false)
        onBotCreated()
        resetForm()
      } else {
        toast.error(result.error || "Failed to create bot")
      }
    } catch (error) {
      console.error("Bot creation failed:", error)
      toast.error("Failed to create bot")
    } finally {
      setCreating(false)
    }
  }

  const resetForm = () => {
    setConfig({
      name: "",
      exchange: "",
      strategy: "",
      symbol: "BTCUSDT",
      apiKey: "",
      secretKey: "",
      passphrase: "",
      investment: 100,
      riskLevel: 5,
      stopLoss: 5,
      takeProfit: 10,
      leverage: 1,
      dcaInterval: "1h",
      aiRecommendations: true,
      runtime: {
        type: "time",
        value: 24,
      },
      parameters: {},
    })
    setCurrentTab("strategy")
    setConnectionTested(false)
    setRiskAnalysisResult(null)
  }

  const updateConfig = (updates: Partial<BotConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }))
  }

  const updateParameters = (key: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      parameters: { ...prev.parameters, [key]: value },
    }))
  }

  const canProceedToNext = () => {
    switch (currentTab) {
      case "strategy":
        return config.strategy && config.symbol
      case "exchange":
        return config.exchange && config.apiKey && config.secretKey && connectionTested
      case "config":
        return config.name && config.investment > 0
      case "risk":
        return riskAnalysisResult && !riskAnalysisResult.shouldBlock
      default:
        return false
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Bot
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Create Trading Bot
          </DialogTitle>
          <DialogDescription>Set up your automated trading bot with AI-powered risk analysis</DialogDescription>
        </DialogHeader>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="strategy">Strategy</TabsTrigger>
            <TabsTrigger value="exchange" disabled={!config.strategy}>
              Exchange
            </TabsTrigger>
            <TabsTrigger value="config" disabled={!connectionTested}>
              Config
            </TabsTrigger>
            <TabsTrigger value="risk" disabled={!config.name}>
              Risk Check
            </TabsTrigger>
            <TabsTrigger value="review" disabled={!riskAnalysisResult}>
              Review
            </TabsTrigger>
          </TabsList>

          {/* Strategy Selection */}
          <TabsContent value="strategy" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Choose Trading Strategy</CardTitle>
                <CardDescription>
                  Select the trading strategy that best fits your goals and risk tolerance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {STRATEGIES.map((strategy) => (
                    <Card
                      key={strategy.id}
                      className={`cursor-pointer transition-all ${
                        config.strategy === strategy.id ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
                      }`}
                      onClick={() => updateConfig({ strategy: strategy.id })}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">{strategy.name}</h3>
                          <Badge
                            variant={
                              strategy.riskLevel === "Low"
                                ? "secondary"
                                : strategy.riskLevel === "Medium"
                                  ? "default"
                                  : "destructive"
                            }
                          >
                            {strategy.riskLevel}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{strategy.description}</p>
                        <Badge variant="outline" className="text-xs">
                          Requires {strategy.minPlan} plan
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="symbol">Trading Pair</Label>
                  <Select value={config.symbol} onValueChange={(value) => updateConfig({ symbol: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select trading pair" />
                    </SelectTrigger>
                    <SelectContent>
                      {POPULAR_SYMBOLS.map((symbol) => (
                        <SelectItem key={symbol} value={symbol}>
                          {symbol}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Exchange Configuration */}
          <TabsContent value="exchange" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Exchange Configuration</CardTitle>
                <CardDescription>Connect your exchange account with API credentials</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="exchange">Exchange</Label>
                  <Select value={config.exchange} onValueChange={(value) => updateConfig({ exchange: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select exchange" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXCHANGES.map((exchange) => (
                        <SelectItem key={exchange.id} value={exchange.id}>
                          {exchange.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      value={config.apiKey}
                      onChange={(e) => updateConfig({ apiKey: e.target.value })}
                      placeholder="Enter API key"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secretKey">Secret Key</Label>
                    <Input
                      id="secretKey"
                      type="password"
                      value={config.secretKey}
                      onChange={(e) => updateConfig({ secretKey: e.target.value })}
                      placeholder="Enter secret key"
                    />
                  </div>
                </div>

                {selectedExchange?.requiresPassphrase && (
                  <div className="space-y-2">
                    <Label htmlFor="passphrase">Passphrase</Label>
                    <Input
                      id="passphrase"
                      type="password"
                      value={config.passphrase}
                      onChange={(e) => updateConfig({ passphrase: e.target.value })}
                      placeholder="Enter passphrase"
                    />
                  </div>
                )}

                <Button
                  onClick={testConnection}
                  disabled={testingConnection || !config.apiKey || !config.secretKey}
                  className="w-full"
                >
                  {testingConnection ? "Testing..." : "Test Connection"}
                </Button>

                {connectionTested && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-green-700 text-sm">✓ Connection successful</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Basic Configuration */}
          <TabsContent value="config" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Bot Configuration</CardTitle>
                <CardDescription>Configure your bot's basic settings and parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Bot Name</Label>
                  <Input
                    id="name"
                    value={config.name}
                    onChange={(e) => updateConfig({ name: e.target.value })}
                    placeholder="Enter bot name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="investment">Investment Amount ($)</Label>
                    <Input
                      id="investment"
                      type="number"
                      value={config.investment}
                      onChange={(e) => updateConfig({ investment: Number(e.target.value) })}
                      min="1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="leverage">Leverage (1x-20x)</Label>
                    <Input
                      id="leverage"
                      type="number"
                      value={config.leverage}
                      onChange={(e) => updateConfig({ leverage: Number(e.target.value) })}
                      min="1"
                      max="20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stopLoss">Stop Loss (%)</Label>
                    <Input
                      id="stopLoss"
                      type="number"
                      value={config.stopLoss}
                      onChange={(e) => updateConfig({ stopLoss: Number(e.target.value) })}
                      min="0.1"
                      max="50"
                      step="0.1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="takeProfit">Take Profit (%)</Label>
                    <Input
                      id="takeProfit"
                      type="number"
                      value={config.takeProfit}
                      onChange={(e) => updateConfig({ takeProfit: Number(e.target.value) })}
                      min="0.1"
                      max="100"
                      step="0.1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Risk Level: {config.riskLevel}/10</Label>
                  <Slider
                    value={[config.riskLevel]}
                    onValueChange={(value) => updateConfig({ riskLevel: value[0] })}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-4">
                  <Label>Runtime Configuration</Label>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="time-based"
                        checked={config.runtime.type === "time"}
                        onChange={() => updateConfig({ runtime: { ...config.runtime, type: "time" } })}
                      />
                      <Label htmlFor="time-based">Time-based</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="profit-based"
                        checked={config.runtime.type === "profit"}
                        onChange={() => updateConfig({ runtime: { ...config.runtime, type: "profit" } })}
                      />
                      <Label htmlFor="profit-based">Profit-based</Label>
                    </div>
                  </div>
                  <Input
                    type="number"
                    value={config.runtime.value}
                    onChange={(e) =>
                      updateConfig({
                        runtime: { ...config.runtime, value: Number(e.target.value) },
                      })
                    }
                    placeholder={config.runtime.type === "time" ? "Hours" : "Profit target ($)"}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="ai-recommendations"
                    checked={config.aiRecommendations}
                    onCheckedChange={(checked) => updateConfig({ aiRecommendations: checked })}
                  />
                  <Label htmlFor="ai-recommendations">Enable AI Recommendations</Label>
                </div>

                {/* Strategy-specific parameters */}
                {config.strategy === "dca" && (
                  <div className="space-y-2">
                    <Label htmlFor="dcaInterval">DCA Interval</Label>
                    <Select value={config.dcaInterval} onValueChange={(value) => updateConfig({ dcaInterval: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15m">15 minutes</SelectItem>
                        <SelectItem value="1h">1 hour</SelectItem>
                        <SelectItem value="4h">4 hours</SelectItem>
                        <SelectItem value="1d">1 day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {config.strategy === "grid" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gridLevels">Grid Levels</Label>
                      <Input
                        id="gridLevels"
                        type="number"
                        value={config.parameters.gridLevels || 10}
                        onChange={(e) => updateParameters("gridLevels", Number(e.target.value))}
                        min="3"
                        max="50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gridSpacing">Grid Spacing (%)</Label>
                      <Input
                        id="gridSpacing"
                        type="number"
                        value={config.parameters.gridSpacing || 2}
                        onChange={(e) => updateParameters("gridSpacing", Number(e.target.value))}
                        min="0.1"
                        max="10"
                        step="0.1"
                      />
                    </div>
                  </div>
                )}

                {config.strategy === "scalping" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="maxHoldTime">Max Hold Time (minutes)</Label>
                      <Input
                        id="maxHoldTime"
                        type="number"
                        value={config.parameters.maxHoldTime || 30}
                        onChange={(e) => updateParameters("maxHoldTime", Number(e.target.value))}
                        min="1"
                        max="120"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profitTarget">Profit Target (%)</Label>
                      <Input
                        id="profitTarget"
                        type="number"
                        value={config.parameters.profitTarget || 0.5}
                        onChange={(e) => updateParameters("profitTarget", Number(e.target.value))}
                        min="0.1"
                        max="5"
                        step="0.1"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Risk Analysis */}
          <TabsContent value="risk" className="space-y-4">
            <AIRiskCheck userId={userId} botConfig={config} onRiskAnalysisComplete={setRiskAnalysisResult} />
          </TabsContent>

          {/* Review & Create */}
          <TabsContent value="review" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Review Configuration</CardTitle>
                <CardDescription>Review your bot configuration before creation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Basic Settings</h4>
                    <ul className="space-y-1 text-sm">
                      <li>
                        <strong>Name:</strong> {config.name}
                      </li>
                      <li>
                        <strong>Strategy:</strong> {selectedStrategy?.name}
                      </li>
                      <li>
                        <strong>Exchange:</strong> {selectedExchange?.name}
                      </li>
                      <li>
                        <strong>Symbol:</strong> {config.symbol}
                      </li>
                      <li>
                        <strong>Investment:</strong> ${config.investment}
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Risk Management</h4>
                    <ul className="space-y-1 text-sm">
                      <li>
                        <strong>Stop Loss:</strong> {config.stopLoss}%
                      </li>
                      <li>
                        <strong>Take Profit:</strong> {config.takeProfit}%
                      </li>
                      <li>
                        <strong>Leverage:</strong> {config.leverage}x
                      </li>
                      <li>
                        <strong>Risk Level:</strong> {config.riskLevel}/10
                      </li>
                      <li>
                        <strong>AI Recommendations:</strong> {config.aiRecommendations ? "Enabled" : "Disabled"}
                      </li>
                    </ul>
                  </div>
                </div>

                {riskAnalysisResult && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Risk Analysis Summary</h4>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        className={
                          riskAnalysisResult.riskLevel === "low"
                            ? "bg-green-100 text-green-700"
                            : riskAnalysisResult.riskLevel === "medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : riskAnalysisResult.riskLevel === "high"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-red-100 text-red-700"
                        }
                      >
                        {riskAnalysisResult.riskLevel.toUpperCase()} RISK
                      </Badge>
                      <span className="text-sm">Score: {riskAnalysisResult.riskScore}/100</span>
                    </div>
                    {riskAnalysisResult.shouldBlock && (
                      <p className="text-red-600 text-sm">⚠️ This configuration has been blocked due to high risk</p>
                    )}
                  </div>
                )}

                <Button
                  onClick={createBot}
                  disabled={creating || riskAnalysisResult?.shouldBlock}
                  className="w-full"
                  size="lg"
                >
                  {creating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Bot...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Create Bot
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => {
              const tabs = ["strategy", "exchange", "config", "risk", "review"]
              const currentIndex = tabs.indexOf(currentTab)
              if (currentIndex > 0) {
                setCurrentTab(tabs[currentIndex - 1])
              }
            }}
            disabled={currentTab === "strategy"}
          >
            Previous
          </Button>

          <Button
            onClick={() => {
              const tabs = ["strategy", "exchange", "config", "risk", "review"]
              const currentIndex = tabs.indexOf(currentTab)
              if (currentIndex < tabs.length - 1 && canProceedToNext()) {
                setCurrentTab(tabs[currentIndex + 1])
              }
            }}
            disabled={currentTab === "review" || !canProceedToNext()}
          >
            Next
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
