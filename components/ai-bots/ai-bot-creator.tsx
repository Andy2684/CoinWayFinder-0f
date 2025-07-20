"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Brain, Zap, Target, BarChart3, Settings, TrendingUp, Shield, Cpu, Database, Network } from "lucide-react"

interface AIBotConfig {
  name: string
  type: "neural_network" | "deep_learning" | "reinforcement" | "ensemble"
  tradingPairs: string[]
  investment: number
  riskLevel: number
  learningRate: number
  epochs: number
  batchSize: number
  features: string[]
  stopLoss: number
  takeProfit: number
  maxPositions: number
  rebalanceFrequency: string
  backtestPeriod: string
  enablePaperTrading: boolean
  description: string
}

export function AIBotCreator() {
  const [config, setConfig] = useState<AIBotConfig>({
    name: "",
    type: "neural_network",
    tradingPairs: [],
    investment: 1000,
    riskLevel: 50,
    learningRate: 0.001,
    epochs: 100,
    batchSize: 32,
    features: [],
    stopLoss: 5,
    takeProfit: 10,
    maxPositions: 5,
    rebalanceFrequency: "hourly",
    backtestPeriod: "3months",
    enablePaperTrading: true,
    description: "",
  })

  const [currentStep, setCurrentStep] = useState(0)
  const [isCreating, setIsCreating] = useState(false)

  const aiTypes = [
    {
      id: "neural_network",
      name: "Neural Network",
      description: "Multi-layer perceptron for pattern recognition",
      icon: Brain,
      complexity: "Intermediate",
      bestFor: "Trend prediction, price forecasting",
    },
    {
      id: "deep_learning",
      name: "Deep Learning",
      description: "Advanced neural networks with multiple hidden layers",
      icon: Zap,
      complexity: "Advanced",
      bestFor: "Complex pattern recognition, high-frequency trading",
    },
    {
      id: "reinforcement",
      name: "Reinforcement Learning",
      description: "AI that learns through trial and reward optimization",
      icon: Target,
      complexity: "Expert",
      bestFor: "Adaptive strategies, dynamic market conditions",
    },
    {
      id: "ensemble",
      name: "Ensemble AI",
      description: "Combination of multiple AI models for better accuracy",
      icon: BarChart3,
      complexity: "Expert",
      bestFor: "Maximum accuracy, risk diversification",
    },
  ]

  const tradingPairs = [
    "BTC/USDT",
    "ETH/USDT",
    "BNB/USDT",
    "ADA/USDT",
    "SOL/USDT",
    "DOT/USDT",
    "MATIC/USDT",
    "LINK/USDT",
    "UNI/USDT",
    "AVAX/USDT",
  ]

  const features = [
    "Price Action",
    "Volume Analysis",
    "Technical Indicators",
    "Market Sentiment",
    "Social Media Sentiment",
    "News Analysis",
    "Order Book Data",
    "Whale Movements",
    "Cross-Exchange Arbitrage",
    "Volatility Patterns",
    "Correlation Analysis",
    "Macro Economics",
  ]

  const handleCreateBot = async () => {
    setIsCreating(true)

    // Simulate AI bot creation process
    await new Promise((resolve) => setTimeout(resolve, 3000))

    console.log("Creating AI Bot with config:", config)
    setIsCreating(false)

    // Reset form or redirect
    alert("AI Trading Bot created successfully!")
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case "Intermediate":
        return "bg-yellow-500/10 text-yellow-400"
      case "Advanced":
        return "bg-orange-500/10 text-orange-400"
      case "Expert":
        return "bg-red-500/10 text-red-400"
      default:
        return "bg-gray-500/10 text-gray-400"
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          AI Trading Bot Creator
        </h1>
        <p className="text-muted-foreground">
          Build and deploy advanced AI-powered trading bots with machine learning algorithms
        </p>
      </div>

      <Tabs defaultValue="type" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="type">AI Type</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="risk">Risk Management</TabsTrigger>
          <TabsTrigger value="deploy">Deploy</TabsTrigger>
        </TabsList>

        {/* AI Type Selection */}
        <TabsContent value="type" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="w-5 h-5 mr-2" />
                Choose AI Algorithm Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiTypes.map((type) => (
                  <Card
                    key={type.id}
                    className={`cursor-pointer transition-colors ${
                      config.type === type.id ? "border-primary bg-primary/5" : "hover:border-primary/50"
                    }`}
                    onClick={() => setConfig({ ...config, type: type.id as any })}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <type.icon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">{type.name}</h3>
                            <Badge className={getComplexityColor(type.complexity)}>{type.complexity}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{type.description}</p>
                          <p className="text-xs text-primary">Best for: {type.bestFor}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuration */}
        <TabsContent value="config" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Basic Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="botName">Bot Name</Label>
                  <Input
                    id="botName"
                    placeholder="My AI Trading Bot"
                    value={config.name}
                    onChange={(e) => setConfig({ ...config, name: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Trading Pairs</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {tradingPairs.map((pair) => (
                      <div key={pair} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={pair}
                          checked={config.tradingPairs.includes(pair)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setConfig({
                                ...config,
                                tradingPairs: [...config.tradingPairs, pair],
                              })
                            } else {
                              setConfig({
                                ...config,
                                tradingPairs: config.tradingPairs.filter((p) => p !== pair),
                              })
                            }
                          }}
                          className="rounded"
                        />
                        <Label htmlFor={pair} className="text-sm">
                          {pair}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="investment">Initial Investment ($)</Label>
                  <Input
                    id="investment"
                    type="number"
                    value={config.investment}
                    onChange={(e) => setConfig({ ...config, investment: Number(e.target.value) })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Cpu className="w-5 h-5 mr-2" />
                  AI Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Learning Rate: {config.learningRate}</Label>
                  <Slider
                    value={[config.learningRate * 1000]}
                    onValueChange={(value) => setConfig({ ...config, learningRate: value[0] / 1000 })}
                    max={10}
                    min={0.1}
                    step={0.1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="epochs">Training Epochs</Label>
                  <Input
                    id="epochs"
                    type="number"
                    value={config.epochs}
                    onChange={(e) => setConfig({ ...config, epochs: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <Label htmlFor="batchSize">Batch Size</Label>
                  <Select
                    value={config.batchSize.toString()}
                    onValueChange={(value) => setConfig({ ...config, batchSize: Number(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="16">16</SelectItem>
                      <SelectItem value="32">32</SelectItem>
                      <SelectItem value="64">64</SelectItem>
                      <SelectItem value="128">128</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="backtestPeriod">Backtest Period</Label>
                  <Select
                    value={config.backtestPeriod}
                    onValueChange={(value) => setConfig({ ...config, backtestPeriod: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1month">1 Month</SelectItem>
                      <SelectItem value="3months">3 Months</SelectItem>
                      <SelectItem value="6months">6 Months</SelectItem>
                      <SelectItem value="1year">1 Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Features */}
        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2" />
                AI Training Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Select the data features your AI will use for training and decision making
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {features.map((feature) => (
                  <div key={feature} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={feature}
                      checked={config.features.includes(feature)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setConfig({
                            ...config,
                            features: [...config.features, feature],
                          })
                        } else {
                          setConfig({
                            ...config,
                            features: config.features.filter((f) => f !== feature),
                          })
                        }
                      }}
                      className="rounded"
                    />
                    <Label htmlFor={feature} className="text-sm">
                      {feature}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk Management */}
        <TabsContent value="risk" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Risk Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Risk Level: {config.riskLevel}%</Label>
                  <Slider
                    value={[config.riskLevel]}
                    onValueChange={(value) => setConfig({ ...config, riskLevel: value[0] })}
                    max={100}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Stop Loss: {config.stopLoss}%</Label>
                  <Slider
                    value={[config.stopLoss]}
                    onValueChange={(value) => setConfig({ ...config, stopLoss: value[0] })}
                    max={20}
                    min={1}
                    step={0.5}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Take Profit: {config.takeProfit}%</Label>
                  <Slider
                    value={[config.takeProfit]}
                    onValueChange={(value) => setConfig({ ...config, takeProfit: value[0] })}
                    max={50}
                    min={2}
                    step={0.5}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="maxPositions">Max Concurrent Positions</Label>
                  <Input
                    id="maxPositions"
                    type="number"
                    value={config.maxPositions}
                    onChange={(e) => setConfig({ ...config, maxPositions: Number(e.target.value) })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Trading Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="rebalanceFreq">Rebalance Frequency</Label>
                  <Select
                    value={config.rebalanceFrequency}
                    onValueChange={(value) => setConfig({ ...config, rebalanceFrequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minute">Every Minute</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="paperTrading">Enable Paper Trading</Label>
                  <Switch
                    id="paperTrading"
                    checked={config.enablePaperTrading}
                    onCheckedChange={(checked) => setConfig({ ...config, enablePaperTrading: checked })}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your AI trading strategy..."
                    value={config.description}
                    onChange={(e) => setConfig({ ...config, description: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Deploy */}
        <TabsContent value="deploy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Network className="w-5 h-5 mr-2" />
                Deploy AI Trading Bot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-6">
                <h3 className="font-semibold mb-4">Configuration Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Bot Name:</span>
                    <span className="ml-2 font-medium">{config.name || "Unnamed Bot"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">AI Type:</span>
                    <span className="ml-2 font-medium capitalize">{config.type.replace("_", " ")}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Investment:</span>
                    <span className="ml-2 font-medium">${config.investment.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Trading Pairs:</span>
                    <span className="ml-2 font-medium">{config.tradingPairs.length} pairs</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Risk Level:</span>
                    <span className="ml-2 font-medium">{config.riskLevel}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Features:</span>
                    <span className="ml-2 font-medium">{config.features.length} selected</span>
                  </div>
                </div>
              </div>

              {isCreating && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="inline-flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span>Creating AI Trading Bot...</span>
                    </div>
                  </div>
                  <Progress value={66} className="w-full" />
                  <p className="text-sm text-muted-foreground text-center">
                    Training neural network and optimizing parameters...
                  </p>
                </div>
              )}

              <div className="flex justify-center">
                <Button
                  onClick={handleCreateBot}
                  disabled={!config.name || config.tradingPairs.length === 0 || isCreating}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 px-8"
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Bot...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Deploy AI Bot
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
