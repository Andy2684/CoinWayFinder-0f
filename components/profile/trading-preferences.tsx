"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Shield, TrendingUp, Bot, Target, Save } from "lucide-react"

export function TradingPreferences() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [riskSettings, setRiskSettings] = useState({
    maxDailyLoss: [500],
    maxPositionSize: [25],
    stopLossPercentage: [5],
    takeProfitPercentage: [15],
    maxOpenPositions: [10],
    riskPerTrade: [2],
  })

  const [tradingSettings, setTradingSettings] = useState({
    preferredExchanges: ["binance", "coinbase"],
    defaultSlippage: "0.5",
    tradingHours: "24/7",
    autoRebalance: true,
    compoundProfits: true,
    paperTrading: false,
    advancedOrders: true,
  })

  const [botSettings, setBotSettings] = useState({
    autoStart: false,
    maxActiveBots: [5],
    defaultStrategy: "dca",
    riskLevel: "medium",
    profitTarget: [20],
    stopLoss: [10],
  })

  const [alertSettings, setAlertSettings] = useState({
    priceAlerts: true,
    profitAlerts: true,
    lossAlerts: true,
    botStatusAlerts: true,
    marketVolatilityAlerts: false,
    newsAlerts: true,
  })

  const exchanges = [
    { id: "binance", name: "Binance", status: "connected" },
    { id: "coinbase", name: "Coinbase Pro", status: "connected" },
    { id: "kraken", name: "Kraken", status: "disconnected" },
    { id: "bybit", name: "Bybit", status: "disconnected" },
  ]

  const handleRiskSettingChange = (key: string, value: number[]) => {
    setRiskSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleTradingSettingChange = (key: string, value: any) => {
    setTradingSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleBotSettingChange = (key: string, value: any) => {
    setBotSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleAlertSettingChange = (key: string, value: boolean) => {
    setAlertSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Settings Saved",
        description: "Your trading preferences have been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Risk Management */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Risk Management
          </CardTitle>
          <CardDescription>Set your risk limits and protection parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-white">Max Daily Loss: ${riskSettings.maxDailyLoss[0]}</Label>
              <Slider
                value={riskSettings.maxDailyLoss}
                onValueChange={(value) => handleRiskSettingChange("maxDailyLoss", value)}
                max={2000}
                min={100}
                step={50}
                className="w-full"
              />
              <p className="text-xs text-gray-400">Maximum amount you're willing to lose per day</p>
            </div>

            <div className="space-y-3">
              <Label className="text-white">Max Position Size: {riskSettings.maxPositionSize[0]}%</Label>
              <Slider
                value={riskSettings.maxPositionSize}
                onValueChange={(value) => handleRiskSettingChange("maxPositionSize", value)}
                max={50}
                min={5}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-gray-400">Maximum percentage of portfolio per position</p>
            </div>

            <div className="space-y-3">
              <Label className="text-white">Stop Loss: {riskSettings.stopLossPercentage[0]}%</Label>
              <Slider
                value={riskSettings.stopLossPercentage}
                onValueChange={(value) => handleRiskSettingChange("stopLossPercentage", value)}
                max={20}
                min={1}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-gray-400">Default stop loss percentage</p>
            </div>

            <div className="space-y-3">
              <Label className="text-white">Take Profit: {riskSettings.takeProfitPercentage[0]}%</Label>
              <Slider
                value={riskSettings.takeProfitPercentage}
                onValueChange={(value) => handleRiskSettingChange("takeProfitPercentage", value)}
                max={50}
                min={5}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-gray-400">Default take profit percentage</p>
            </div>

            <div className="space-y-3">
              <Label className="text-white">Max Open Positions: {riskSettings.maxOpenPositions[0]}</Label>
              <Slider
                value={riskSettings.maxOpenPositions}
                onValueChange={(value) => handleRiskSettingChange("maxOpenPositions", value)}
                max={20}
                min={1}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-gray-400">Maximum number of concurrent positions</p>
            </div>

            <div className="space-y-3">
              <Label className="text-white">Risk Per Trade: {riskSettings.riskPerTrade[0]}%</Label>
              <Slider
                value={riskSettings.riskPerTrade}
                onValueChange={(value) => handleRiskSettingChange("riskPerTrade", value)}
                max={10}
                min={0.5}
                step={0.5}
                className="w-full"
              />
              <p className="text-xs text-gray-400">Percentage of portfolio to risk per trade</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trading Settings */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Trading Settings
          </CardTitle>
          <CardDescription>Configure your trading preferences and behavior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white">Preferred Exchanges</Label>
              <div className="grid grid-cols-2 gap-2">
                {exchanges.map((exchange) => (
                  <div
                    key={exchange.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      tradingSettings.preferredExchanges.includes(exchange.id)
                        ? "bg-blue-500/10 border-blue-500/20"
                        : "bg-slate-700/50 border-slate-600"
                    }`}
                  >
                    <span className="text-white text-sm">{exchange.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={exchange.status === "connected" ? "default" : "secondary"} className="text-xs">
                        {exchange.status}
                      </Badge>
                      <Switch
                        checked={tradingSettings.preferredExchanges.includes(exchange.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleTradingSettingChange("preferredExchanges", [
                              ...tradingSettings.preferredExchanges,
                              exchange.id,
                            ])
                          } else {
                            handleTradingSettingChange(
                              "preferredExchanges",
                              tradingSettings.preferredExchanges.filter((id) => id !== exchange.id),
                            )
                          }
                        }}
                        disabled={exchange.status === "disconnected"}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="slippage" className="text-white">
                  Default Slippage (%)
                </Label>
                <Select
                  value={tradingSettings.defaultSlippage}
                  onValueChange={(value) => handleTradingSettingChange("defaultSlippage", value)}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.1">0.1%</SelectItem>
                    <SelectItem value="0.5">0.5%</SelectItem>
                    <SelectItem value="1.0">1.0%</SelectItem>
                    <SelectItem value="2.0">2.0%</SelectItem>
                    <SelectItem value="5.0">5.0%</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tradingHours" className="text-white">
                  Trading Hours
                </Label>
                <Select
                  value={tradingSettings.tradingHours}
                  onValueChange={(value) => handleTradingSettingChange("tradingHours", value)}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24/7">24/7</SelectItem>
                    <SelectItem value="market-hours">Market Hours Only</SelectItem>
                    <SelectItem value="custom">Custom Hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-white font-medium">Auto Rebalance</p>
                  <p className="text-sm text-gray-400">Automatically rebalance portfolio based on target allocations</p>
                </div>
                <Switch
                  checked={tradingSettings.autoRebalance}
                  onCheckedChange={(value) => handleTradingSettingChange("autoRebalance", value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-white font-medium">Compound Profits</p>
                  <p className="text-sm text-gray-400">Reinvest profits to increase position sizes</p>
                </div>
                <Switch
                  checked={tradingSettings.compoundProfits}
                  onCheckedChange={(value) => handleTradingSettingChange("compoundProfits", value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-white font-medium">Paper Trading Mode</p>
                  <p className="text-sm text-gray-400">Test strategies without real money</p>
                </div>
                <Switch
                  checked={tradingSettings.paperTrading}
                  onCheckedChange={(value) => handleTradingSettingChange("paperTrading", value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-white font-medium">Advanced Orders</p>
                  <p className="text-sm text-gray-400">Enable advanced order types (OCO, trailing stops, etc.)</p>
                </div>
                <Switch
                  checked={tradingSettings.advancedOrders}
                  onCheckedChange={(value) => handleTradingSettingChange("advancedOrders", value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bot Configuration */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Bot Configuration
          </CardTitle>
          <CardDescription>Default settings for your trading bots</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-white font-medium">Auto Start New Bots</p>
              <p className="text-sm text-gray-400">Automatically start bots after creation</p>
            </div>
            <Switch
              checked={botSettings.autoStart}
              onCheckedChange={(value) => handleBotSettingChange("autoStart", value)}
            />
          </div>

          <div className="space-y-3">
            <Label className="text-white">Max Active Bots: {botSettings.maxActiveBots[0]}</Label>
            <Slider
              value={botSettings.maxActiveBots}
              onValueChange={(value) => handleBotSettingChange("maxActiveBots", value)}
              max={20}
              min={1}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-gray-400">Maximum number of bots that can run simultaneously</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Default Strategy</Label>
              <Select
                value={botSettings.defaultStrategy}
                onValueChange={(value) => handleBotSettingChange("defaultStrategy", value)}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dca">Dollar Cost Averaging</SelectItem>
                  <SelectItem value="grid">Grid Trading</SelectItem>
                  <SelectItem value="momentum">Momentum Trading</SelectItem>
                  <SelectItem value="arbitrage">Arbitrage</SelectItem>
                  <SelectItem value="scalping">Scalping</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Risk Level</Label>
              <Select
                value={botSettings.riskLevel}
                onValueChange={(value) => handleBotSettingChange("riskLevel", value)}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                  <SelectItem value="aggressive">Aggressive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-white">Default Profit Target: {botSettings.profitTarget[0]}%</Label>
              <Slider
                value={botSettings.profitTarget}
                onValueChange={(value) => handleBotSettingChange("profitTarget", value)}
                max={100}
                min={5}
                step={5}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-white">Default Stop Loss: {botSettings.stopLoss[0]}%</Label>
              <Slider
                value={botSettings.stopLoss}
                onValueChange={(value) => handleBotSettingChange("stopLoss", value)}
                max={50}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert Settings */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="h-5 w-5" />
            Alert Settings
          </CardTitle>
          <CardDescription>Configure when you want to receive trading alerts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-white font-medium">Price Alerts</p>
                <p className="text-sm text-gray-400">Significant price movements</p>
              </div>
              <Switch
                checked={alertSettings.priceAlerts}
                onCheckedChange={(value) => handleAlertSettingChange("priceAlerts", value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-white font-medium">Profit Alerts</p>
                <p className="text-sm text-gray-400">When positions reach profit targets</p>
              </div>
              <Switch
                checked={alertSettings.profitAlerts}
                onCheckedChange={(value) => handleAlertSettingChange("profitAlerts", value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-white font-medium">Loss Alerts</p>
                <p className="text-sm text-gray-400">When positions hit stop losses</p>
              </div>
              <Switch
                checked={alertSettings.lossAlerts}
                onCheckedChange={(value) => handleAlertSettingChange("lossAlerts", value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-white font-medium">Bot Status Alerts</p>
                <p className="text-sm text-gray-400">Bot start, stop, and error notifications</p>
              </div>
              <Switch
                checked={alertSettings.botStatusAlerts}
                onCheckedChange={(value) => handleAlertSettingChange("botStatusAlerts", value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-white font-medium">Market Volatility</p>
                <p className="text-sm text-gray-400">High volatility warnings</p>
              </div>
              <Switch
                checked={alertSettings.marketVolatilityAlerts}
                onCheckedChange={(value) => handleAlertSettingChange("marketVolatilityAlerts", value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-white font-medium">News Alerts</p>
                <p className="text-sm text-gray-400">Important market news</p>
              </div>
              <Switch
                checked={alertSettings.newsAlerts}
                onCheckedChange={(value) => handleAlertSettingChange("newsAlerts", value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Save className="h-4 w-4 mr-2" />
          {loading ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </div>
  )
}
