"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Bot, Settings, TrendingUp, Shield, Zap, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export function CreateBotDialog() {
  const [open, setOpen] = useState(false)
  const [selectedStrategy, setSelectedStrategy] = useState("")
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle")
  const [isCreating, setIsCreating] = useState(false)

  const [botConfig, setBotConfig] = useState({
    name: "",
    exchange: "",
    strategy: "",
    symbol: "",
    apiKey: "",
    secretKey: "",
    riskLevel: 50,
    lotSize: 0.001,
    takeProfit: 5,
    stopLoss: 3,
    dcaInterval: "1h",
    investment: 100,
    // Strategy-specific parameters
    priceDeviation: 5,
    maxOrders: 10,
    maxHoldTime: 30,
    rsiPeriod: 14,
    rsiOverbought: 70,
    rsiOversold: 30,
    macdFast: 12,
    macdSlow: 26,
    macdSignal: 9,
  })

  const strategies = [
    {
      id: "dca",
      name: "DCA (Dollar Cost Averaging)",
      description: "Buy at regular intervals regardless of price",
      difficulty: "Beginner",
      risk: "Low",
      icon: TrendingUp,
      color: "bg-blue-500/10 text-blue-400",
    },
    {
      id: "scalping",
      name: "Scalping Bot",
      description: "High-frequency small profit trades using technical indicators",
      difficulty: "Advanced",
      risk: "High",
      icon: Zap,
      color: "bg-red-500/10 text-red-400",
    },
  ]

  const exchanges = [
    { id: "binance", name: "Binance", supported: true },
    { id: "bybit", name: "Bybit", supported: true },
  ]

  const tradingPairs = [
    "BTCUSDT",
    "ETHUSDT",
    "BNBUSDT",
    "SOLUSDT",
    "ADAUSDT",
    "DOTUSDT",
    "MATICUSDT",
    "LINKUSDT",
    "UNIUSDT",
    "AVAXUSDT",
  ]

  const dcaIntervals = [
    { value: "5m", label: "5 minutes" },
    { value: "15m", label: "15 minutes" },
    { value: "30m", label: "30 minutes" },
    { value: "1h", label: "1 hour" },
    { value: "4h", label: "4 hours" },
    { value: "1d", label: "Daily" },
  ]

  const testConnection = async () => {
    if (!botConfig.exchange || !botConfig.apiKey || !botConfig.secretKey) {
      toast({
        title: "Missing Information",
        description: "Please fill in exchange, API key, and secret key",
        variant: "destructive",
      })
      return
    }

    setIsTestingConnection(true)
    setConnectionStatus("idle")

    try {
      const response = await fetch("/api/test-connection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "demo-user",
        },
        body: JSON.stringify({
          exchange: botConfig.exchange,
          apiKey: botConfig.apiKey,
          secretKey: botConfig.secretKey,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setConnectionStatus("success")
        toast({
          title: "Connection Successful",
          description: "API credentials are valid and working",
        })
      } else {
        setConnectionStatus("error")
        toast({
          title: "Connection Failed",
          description: data.error || "Invalid API credentials",
          variant: "destructive",
        })
      }
    } catch (error) {
      setConnectionStatus("error")
      toast({
        title: "Connection Error",
        description: "Failed to test connection",
        variant: "destructive",
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  const handleCreateBot = async () => {
    if (!selectedStrategy || !botConfig.name || !botConfig.symbol || !botConfig.apiKey || !botConfig.secretKey) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (connectionStatus !== "success") {
      toast({
        title: "Test Connection First",
        description: "Please test your API connection before creating the bot",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)

    try {
      // Prepare strategy-specific parameters
      let parameters: Record<string, any> = {}

      switch (selectedStrategy) {
        case "dca":
          parameters = {
            priceDeviation: botConfig.priceDeviation,
            maxOrders: botConfig.maxOrders,
          }
          break
        case "scalping":
          parameters = {
            maxHoldTime: botConfig.maxHoldTime,
            rsiPeriod: botConfig.rsiPeriod,
            rsiOverbought: botConfig.rsiOverbought,
            rsiOversold: botConfig.rsiOversold,
            macdFast: botConfig.macdFast,
            macdSlow: botConfig.macdSlow,
            macdSignal: botConfig.macdSignal,
          }
          break
      }

      const response = await fetch("/api/bots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "demo-user",
        },
        body: JSON.stringify({
          name: botConfig.name,
          exchange: botConfig.exchange,
          strategy: selectedStrategy,
          symbol: botConfig.symbol,
          apiKey: botConfig.apiKey,
          secretKey: botConfig.secretKey,
          riskLevel: botConfig.riskLevel,
          lotSize: botConfig.lotSize,
          takeProfit: botConfig.takeProfit,
          stopLoss: botConfig.stopLoss,
          dcaInterval: botConfig.dcaInterval,
          investment: botConfig.investment,
          parameters,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Bot Created Successfully",
          description: `${botConfig.name} has been created and is ready to start trading`,
        })

        setOpen(false)
        resetForm()

        // Refresh the page to show the new bot
        window.location.reload()
      } else {
        toast({
          title: "Error Creating Bot",
          description: data.error || "Failed to create trading bot",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error Creating Bot",
        description: "Failed to create trading bot. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const resetForm = () => {
    setBotConfig({
      name: "",
      exchange: "",
      strategy: "",
      symbol: "",
      apiKey: "",
      secretKey: "",
      riskLevel: 50,
      lotSize: 0.001,
      takeProfit: 5,
      stopLoss: 3,
      dcaInterval: "1h",
      investment: 100,
      priceDeviation: 5,
      maxOrders: 10,
      maxHoldTime: 30,
      rsiPeriod: 14,
      rsiOverbought: 70,
      rsiOversold: 30,
      macdFast: 12,
      macdSlow: 26,
      macdSignal: 9,
    })
    setSelectedStrategy("")
    setConnectionStatus("idle")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-[#191A1E] font-semibold">
          <Plus className="w-4 h-4 mr-2" />
          Create New Bot
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            <Bot className="w-5 h-5 mr-2 text-[#30D5C8]" />
            Create Trading Bot
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Configure your automated trading bot with real exchange integration
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="strategy" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800">
            <TabsTrigger value="strategy" className="text-gray-300 data-[state=active]:text-white">
              Strategy
            </TabsTrigger>
            <TabsTrigger value="exchange" className="text-gray-300 data-[state=active]:text-white">
              Exchange
            </TabsTrigger>
            <TabsTrigger value="config" className="text-gray-300 data-[state=active]:text-white">
              Configuration
            </TabsTrigger>
            <TabsTrigger value="risk" className="text-gray-300 data-[state=active]:text-white">
              Risk Management
            </TabsTrigger>
          </TabsList>

          {/* Strategy Selection */}
          <TabsContent value="strategy" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {strategies.map((strategy) => (
                <Card
                  key={strategy.id}
                  className={`cursor-pointer transition-colors ${
                    selectedStrategy === strategy.id
                      ? "border-[#30D5C8] bg-[#30D5C8]/5"
                      : "border-gray-800 bg-gray-900/50 hover:border-gray-700"
                  }`}
                  onClick={() => {
                    setSelectedStrategy(strategy.id)
                    setBotConfig({ ...botConfig, strategy: strategy.id })
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${strategy.color}`}>
                        <strategy.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-sm">{strategy.name}</CardTitle>
                        <p className="text-xs text-gray-400">{strategy.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex space-x-2">
                      <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                        {strategy.difficulty}
                      </Badge>
                      <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                        {strategy.risk} Risk
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Exchange & API Configuration */}
          <TabsContent value="exchange" className="space-y-6">
            <Alert className="border-yellow-500/20 bg-yellow-500/10">
              <Shield className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="text-yellow-200">
                Your API keys are encrypted and stored securely. We recommend using API keys with trading permissions
                only (no withdrawal permissions).
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="exchange" className="text-white">
                    Exchange *
                  </Label>
                  <Select
                    value={botConfig.exchange}
                    onValueChange={(value) => setBotConfig({ ...botConfig, exchange: value })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Select exchange" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      {exchanges.map((exchange) => (
                        <SelectItem key={exchange.id} value={exchange.id} disabled={!exchange.supported}>
                          {exchange.name} {!exchange.supported && "(Coming Soon)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="apiKey" className="text-white">
                    API Key *
                  </Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="Enter your API key"
                    value={botConfig.apiKey}
                    onChange={(e) => setBotConfig({ ...botConfig, apiKey: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="secretKey" className="text-white">
                    Secret Key *
                  </Label>
                  <Input
                    id="secretKey"
                    type="password"
                    placeholder="Enter your secret key"
                    value={botConfig.secretKey}
                    onChange={(e) => setBotConfig({ ...botConfig, secretKey: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-white">Connection Status</Label>
                  {connectionStatus === "success" && <CheckCircle className="w-5 h-5 text-green-400" />}
                  {connectionStatus === "error" && <XCircle className="w-5 h-5 text-red-400" />}
                </div>

                <Button
                  onClick={testConnection}
                  disabled={isTestingConnection || !botConfig.exchange || !botConfig.apiKey || !botConfig.secretKey}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isTestingConnection ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Testing Connection...
                    </>
                  ) : (
                    "Test Connection"
                  )}
                </Button>

                {connectionStatus === "success" && (
                  <Alert className="border-green-500/20 bg-green-500/10">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <AlertDescription className="text-green-200">
                      Connection successful! Your API credentials are valid.
                    </AlertDescription>
                  </Alert>
                )}

                {connectionStatus === "error" && (
                  <Alert className="border-red-500/20 bg-red-500/10">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <AlertDescription className="text-red-200">
                      Connection failed. Please check your API credentials.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Basic Configuration */}
          <TabsContent value="config" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="botName" className="text-white">
                    Bot Name *
                  </Label>
                  <Input
                    id="botName"
                    placeholder="My Trading Bot"
                    value={botConfig.name}
                    onChange={(e) => setBotConfig({ ...botConfig, name: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="tradingPair" className="text-white">
                    Trading Pair *
                  </Label>
                  <Select
                    value={botConfig.symbol}
                    onValueChange={(value) => setBotConfig({ ...botConfig, symbol: value })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Select trading pair" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      {tradingPairs.map((pair) => (
                        <SelectItem key={pair} value={pair}>
                          {pair}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="lotSize" className="text-white">
                    Lot Size (Amount per trade)
                  </Label>
                  <Input
                    id="lotSize"
                    type="number"
                    step="0.001"
                    value={botConfig.lotSize}
                    onChange={(e) => setBotConfig({ ...botConfig, lotSize: Number(e.target.value) })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="investment" className="text-white">
                    Total Investment ($)
                  </Label>
                  <Input
                    id="investment"
                    type="number"
                    value={botConfig.investment}
                    onChange={(e) => setBotConfig({ ...botConfig, investment: Number(e.target.value) })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-white">Risk Level: {botConfig.riskLevel}%</Label>
                  <Slider
                    value={[botConfig.riskLevel]}
                    onValueChange={(value) => setBotConfig({ ...botConfig, riskLevel: value[0] })}
                    max={100}
                    step={1}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Conservative</span>
                    <span>Aggressive</span>
                  </div>
                </div>

                {/* Strategy-specific parameters */}
                {selectedStrategy === "dca" && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-white">DCA Interval</Label>
                      <Select
                        value={botConfig.dcaInterval}
                        onValueChange={(value) => setBotConfig({ ...botConfig, dcaInterval: value })}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-gray-700">
                          {dcaIntervals.map((interval) => (
                            <SelectItem key={interval.value} value={interval.value}>
                              {interval.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-white">Price Deviation Limit: {botConfig.priceDeviation}%</Label>
                      <Slider
                        value={[botConfig.priceDeviation]}
                        onValueChange={(value) => setBotConfig({ ...botConfig, priceDeviation: value[0] })}
                        min={1}
                        max={20}
                        step={0.5}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label className="text-white">Max Orders: {botConfig.maxOrders}</Label>
                      <Slider
                        value={[botConfig.maxOrders]}
                        onValueChange={(value) => setBotConfig({ ...botConfig, maxOrders: value[0] })}
                        min={5}
                        max={50}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                  </div>
                )}

                {selectedStrategy === "scalping" && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-white">Max Hold Time: {botConfig.maxHoldTime} minutes</Label>
                      <Slider
                        value={[botConfig.maxHoldTime]}
                        onValueChange={(value) => setBotConfig({ ...botConfig, maxHoldTime: value[0] })}
                        min={5}
                        max={120}
                        step={5}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label className="text-white">RSI Period: {botConfig.rsiPeriod}</Label>
                      <Slider
                        value={[botConfig.rsiPeriod]}
                        onValueChange={(value) => setBotConfig({ ...botConfig, rsiPeriod: value[0] })}
                        min={7}
                        max={21}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Risk Management */}
          <TabsContent value="risk" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Shield className="w-4 h-4 mr-2 text-red-400" />
                    Stop Loss & Take Profit
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-white">Stop Loss: {botConfig.stopLoss}%</Label>
                    <Slider
                      value={[botConfig.stopLoss]}
                      onValueChange={(value) => setBotConfig({ ...botConfig, stopLoss: value[0] })}
                      max={20}
                      min={1}
                      step={0.5}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Take Profit: {botConfig.takeProfit}%</Label>
                    <Slider
                      value={[botConfig.takeProfit]}
                      onValueChange={(value) => setBotConfig({ ...botConfig, takeProfit: value[0] })}
                      max={50}
                      min={2}
                      step={0.5}
                      className="mt-2"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Settings className="w-4 h-4 mr-2 text-[#30D5C8]" />
                    Advanced Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedStrategy === "scalping" && (
                    <>
                      <div>
                        <Label className="text-white">RSI Overbought: {botConfig.rsiOverbought}</Label>
                        <Slider
                          value={[botConfig.rsiOverbought]}
                          onValueChange={(value) => setBotConfig({ ...botConfig, rsiOverbought: value[0] })}
                          min={60}
                          max={90}
                          step={1}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label className="text-white">RSI Oversold: {botConfig.rsiOversold}</Label>
                        <Slider
                          value={[botConfig.rsiOversold]}
                          onValueChange={(value) => setBotConfig({ ...botConfig, rsiOversold: value[0] })}
                          min={10}
                          max={40}
                          step={1}
                          className="mt-2"
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-white">Enable Notifications</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-white">Auto-restart on Error</Label>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between pt-6 border-t border-gray-800">
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false)
              resetForm()
            }}
            className="border-gray-600 text-white hover:bg-gray-800 bg-transparent"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateBot}
            disabled={
              !selectedStrategy ||
              !botConfig.name ||
              !botConfig.symbol ||
              !botConfig.apiKey ||
              !botConfig.secretKey ||
              connectionStatus !== "success" ||
              isCreating
            }
            className="bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-[#191A1E] font-semibold"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Bot...
              </>
            ) : (
              "Create Bot"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
