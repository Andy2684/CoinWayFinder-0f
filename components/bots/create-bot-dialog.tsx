"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
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
import { Plus, Bot, Settings, TrendingUp, Shield, Zap } from "lucide-react"

export function CreateBotDialog() {
  const [open, setOpen] = useState(false)
  const [selectedStrategy, setSelectedStrategy] = useState("")
  const [botConfig, setBotConfig] = useState({
    name: "",
    strategy: "",
    pair: "",
    investment: 1000,
    riskLevel: 50,
    stopLoss: 5,
    takeProfit: 10,
    maxTrades: 10,
    enableTrailing: false,
    enableDCA: false,
    dcaSteps: 3,
    dcaDeviation: 2,
    description: "",
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
      id: "grid",
      name: "Grid Trading",
      description: "Place orders at predetermined intervals",
      difficulty: "Intermediate",
      risk: "Medium",
      icon: Settings,
      color: "bg-[#30D5C8]/10 text-[#30D5C8]",
    },
    {
      id: "scalping",
      name: "Scalping Bot",
      description: "High-frequency small profit trades",
      difficulty: "Advanced",
      risk: "High",
      icon: Zap,
      color: "bg-red-500/10 text-red-400",
    },
    {
      id: "momentum",
      name: "Momentum Trading",
      description: "Follow strong price trends",
      difficulty: "Intermediate",
      risk: "Medium-High",
      icon: TrendingUp,
      color: "bg-green-500/10 text-green-400",
    },
  ]

  const tradingPairs = [
    "BTC/USDT",
    "ETH/USDT",
    "BNB/USDT",
    "SOL/USDT",
    "ADA/USDT",
    "DOT/USDT",
    "MATIC/USDT",
    "LINK/USDT",
    "UNI/USDT",
    "AVAX/USDT",
  ]

  const handleCreateBot = () => {
    console.log("Creating bot with config:", botConfig)
    setOpen(false)
    // Here you would typically send the config to your API
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
            Configure your automated trading bot with custom parameters and risk management
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="strategy" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800">
            <TabsTrigger value="strategy" className="text-gray-300 data-[state=active]:text-white">
              Strategy
            </TabsTrigger>
            <TabsTrigger value="config" className="text-gray-300 data-[state=active]:text-white">
              Configuration
            </TabsTrigger>
            <TabsTrigger value="risk" className="text-gray-300 data-[state=active]:text-white">
              Risk Management
            </TabsTrigger>
            <TabsTrigger value="advanced" className="text-gray-300 data-[state=active]:text-white">
              Advanced
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

          {/* Basic Configuration */}
          <TabsContent value="config" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="botName" className="text-white">
                    Bot Name
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
                    Trading Pair
                  </Label>
                  <Select value={botConfig.pair} onValueChange={(value) => setBotConfig({ ...botConfig, pair: value })}>
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
                  <Label htmlFor="investment" className="text-white">
                    Initial Investment ($)
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

                <div>
                  <Label htmlFor="maxTrades" className="text-white">
                    Max Concurrent Trades
                  </Label>
                  <Input
                    id="maxTrades"
                    type="number"
                    value={botConfig.maxTrades}
                    onChange={(e) => setBotConfig({ ...botConfig, maxTrades: Number(e.target.value) })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-white">
                    Description (Optional)
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your bot strategy..."
                    value={botConfig.description}
                    onChange={(e) => setBotConfig({ ...botConfig, description: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
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

                  <div className="flex items-center justify-between">
                    <Label htmlFor="trailing" className="text-white">
                      Enable Trailing Stop
                    </Label>
                    <Switch
                      id="trailing"
                      checked={botConfig.enableTrailing}
                      onCheckedChange={(checked) => setBotConfig({ ...botConfig, enableTrailing: checked })}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-[#30D5C8]" />
                    DCA Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enableDCA" className="text-white">
                      Enable DCA
                    </Label>
                    <Switch
                      id="enableDCA"
                      checked={botConfig.enableDCA}
                      onCheckedChange={(checked) => setBotConfig({ ...botConfig, enableDCA: checked })}
                    />
                  </div>

                  {botConfig.enableDCA && (
                    <>
                      <div>
                        <Label htmlFor="dcaSteps" className="text-white">
                          DCA Steps
                        </Label>
                        <Input
                          id="dcaSteps"
                          type="number"
                          value={botConfig.dcaSteps}
                          onChange={(e) => setBotConfig({ ...botConfig, dcaSteps: Number(e.target.value) })}
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>

                      <div>
                        <Label className="text-white">Price Deviation: {botConfig.dcaDeviation}%</Label>
                        <Slider
                          value={[botConfig.dcaDeviation]}
                          onValueChange={(value) => setBotConfig({ ...botConfig, dcaDeviation: value[0] })}
                          max={10}
                          min={0.5}
                          step={0.1}
                          className="mt-2"
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Advanced Settings */}
          <TabsContent value="advanced" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Advanced Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="cooldown" className="text-white">
                      Cooldown Period (minutes)
                    </Label>
                    <Input
                      id="cooldown"
                      type="number"
                      defaultValue="5"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="slippage" className="text-white">
                      Max Slippage (%)
                    </Label>
                    <Input
                      id="slippage"
                      type="number"
                      defaultValue="0.5"
                      step="0.1"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="timeout" className="text-white">
                      Order Timeout (seconds)
                    </Label>
                    <Input
                      id="timeout"
                      type="number"
                      defaultValue="30"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Enable Notifications</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Auto-restart on Error</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Paper Trading Mode</Label>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between pt-6 border-t border-gray-800">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="border-gray-600 text-white hover:bg-gray-800 bg-transparent"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateBot}
            disabled={!selectedStrategy || !botConfig.name || !botConfig.pair}
            className="bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-[#191A1E] font-semibold"
          >
            Create Bot
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
