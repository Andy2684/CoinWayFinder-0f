"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { Settings, TrendingUp, Shield, AlertTriangle, Save } from "lucide-react"

export function TradingPreferences() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const [riskSettings, setRiskSettings] = useState({
    maxDrawdown: [15],
    positionSizeLimit: [5],
    dailyLossLimit: [1000],
    maxOpenPositions: [10],
    stopLossEnabled: true,
    takeProfitEnabled: true,
    riskLevel: "moderate",
  })

  const [tradingSettings, setTradingSettings] = useState({
    defaultExchange: "binance",
    preferredPairs: ["BTC/USDT", "ETH/USDT", "ADA/USDT"],
    autoTradingEnabled: false,
    paperTradingMode: false,
    slippageTolerance: [0.5],
    tradingHours: "24/7",
    minimumTradeAmount: [100],
  })

  const [botSettings, setBotSettings] = useState({
    maxActiveBots: [5],
    botRebalanceFrequency: "daily",
    emergencyStopEnabled: true,
    profitTakingStrategy: "trailing",
    lossLimitPerBot: [500],
  })

  const [alertSettings, setAlertSettings] = useState({
    priceAlerts: true,
    volumeAlerts: false,
    technicalIndicatorAlerts: true,
    newsBasedAlerts: true,
    customAlertThreshold: [5],
  })

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Trading Preferences Saved",
        description: "Your trading settings have been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save trading preferences. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
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
          <CardDescription className="text-gray-400">Configure your risk tolerance and safety limits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white">Maximum Drawdown (%)</Label>
              <div className="px-3">
                <Slider
                  value={riskSettings.maxDrawdown}
                  onValueChange={(value) => setRiskSettings((prev) => ({ ...prev, maxDrawdown: value }))}
                  max={50}
                  min={5}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-400 mt-1">
                  <span>5%</span>
                  <span className="text-white font-medium">{riskSettings.maxDrawdown[0]}%</span>
                  <span>50%</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Position Size Limit (%)</Label>
              <div className="px-3">
                <Slider
                  value={riskSettings.positionSizeLimit}
                  onValueChange={(value) => setRiskSettings((prev) => ({ ...prev, positionSizeLimit: value }))}
                  max={25}
                  min={1}
                  step={0.5}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-400 mt-1">
                  <span>1%</span>
                  <span className="text-white font-medium">{riskSettings.positionSizeLimit[0]}%</span>
                  <span>25%</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Daily Loss Limit ($)</Label>
              <div className="px-3">
                <Slider
                  value={riskSettings.dailyLossLimit}
                  onValueChange={(value) => setRiskSettings((prev) => ({ ...prev, dailyLossLimit: value }))}
                  max={5000}
                  min={100}
                  step={100}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-400 mt-1">
                  <span>$100</span>
                  <span className="text-white font-medium">${riskSettings.dailyLossLimit[0]}</span>
                  <span>$5,000</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Maximum Open Positions</Label>
              <div className="px-3">
                <Slider
                  value={riskSettings.maxOpenPositions}
                  onValueChange={(value) => setRiskSettings((prev) => ({ ...prev, maxOpenPositions: value }))}
                  max={50}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-400 mt-1">
                  <span>1</span>
                  <span className="text-white font-medium">{riskSettings.maxOpenPositions[0]}</span>
                  <span>50</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-white font-medium">Stop Loss</p>
                <p className="text-sm text-gray-400">Automatically close losing positions</p>
              </div>
              <Switch
                checked={riskSettings.stopLossEnabled}
                onCheckedChange={(checked) => setRiskSettings((prev) => ({ ...prev, stopLossEnabled: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-white font-medium">Take Profit</p>
                <p className="text-sm text-gray-400">Automatically close profitable positions</p>
              </div>
              <Switch
                checked={riskSettings.takeProfitEnabled}
                onCheckedChange={(checked) => setRiskSettings((prev) => ({ ...prev, takeProfitEnabled: checked }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Risk Level</Label>
            <Select
              value={riskSettings.riskLevel}
              onValueChange={(value) => setRiskSettings((prev) => ({ ...prev, riskLevel: value }))}
            >
              <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="conservative">Conservative</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="aggressive">Aggressive</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
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
          <CardDescription className="text-gray-400">Configure your default trading parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-white">Default Exchange</Label>
              <Select
                value={tradingSettings.defaultExchange}
                onValueChange={(value) => setTradingSettings((prev) => ({ ...prev, defaultExchange: value }))}
              >
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="binance">Binance</SelectItem>
                  <SelectItem value="coinbase">Coinbase Pro</SelectItem>
                  <SelectItem value="kraken">Kraken</SelectItem>
                  <SelectItem value="kucoin">KuCoin</SelectItem>
                  <SelectItem value="bybit">Bybit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Trading Hours</Label>
              <Select
                value={tradingSettings.tradingHours}
                onValueChange={(value) => setTradingSettings((prev) => ({ ...prev, tradingHours: value }))}
              >
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="24/7">24/7</SelectItem>
                  <SelectItem value="market-hours">Market Hours Only</SelectItem>
                  <SelectItem value="custom">Custom Hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Slippage Tolerance (%)</Label>
            <div className="px-3">
              <Slider
                value={tradingSettings.slippageTolerance}
                onValueChange={(value) => setTradingSettings((prev) => ({ ...prev, slippageTolerance: value }))}
                max={5}
                min={0.1}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-400 mt-1">
                <span>0.1%</span>
                <span className="text-white font-medium">{tradingSettings.slippageTolerance[0]}%</span>
                <span>5%</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Minimum Trade Amount ($)</Label>
            <div className="px-3">
              <Slider
                value={tradingSettings.minimumTradeAmount}
                onValueChange={(value) => setTradingSettings((prev) => ({ ...prev, minimumTradeAmount: value }))}
                max={1000}
                min={10}
                step={10}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-400 mt-1">
                <span>$10</span>
                <span className="text-white font-medium">${tradingSettings.minimumTradeAmount[0]}</span>
                <span>$1,000</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-white font-medium">Auto Trading</p>
                <p className="text-sm text-gray-400">Enable automated trading execution</p>
              </div>
              <Switch
                checked={tradingSettings.autoTradingEnabled}
                onCheckedChange={(checked) => setTradingSettings((prev) => ({ ...prev, autoTradingEnabled: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-white font-medium">Paper Trading Mode</p>
                <p className="text-sm text-gray-400">Practice with virtual money</p>
              </div>
              <Switch
                checked={tradingSettings.paperTradingMode}
                onCheckedChange={(checked) => setTradingSettings((prev) => ({ ...prev, paperTradingMode: checked }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bot Settings */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Bot Settings
          </CardTitle>
          <CardDescription className="text-gray-400">Configure your trading bot preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-white">Maximum Active Bots</Label>
            <div className="px-3">
              <Slider
                value={botSettings.maxActiveBots}
                onValueChange={(value) => setBotSettings((prev) => ({ ...prev, maxActiveBots: value }))}
                max={20}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-400 mt-1">
                <span>1</span>
                <span className="text-white font-medium">{botSettings.maxActiveBots[0]}</span>
                <span>20</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Loss Limit Per Bot ($)</Label>
            <div className="px-3">
              <Slider
                value={botSettings.lossLimitPerBot}
                onValueChange={(value) => setBotSettings((prev) => ({ ...prev, lossLimitPerBot: value }))}
                max={2000}
                min={50}
                step={50}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-400 mt-1">
                <span>$50</span>
                <span className="text-white font-medium">${botSettings.lossLimitPerBot[0]}</span>
                <span>$2,000</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-white">Rebalance Frequency</Label>
              <Select
                value={botSettings.botRebalanceFrequency}
                onValueChange={(value) => setBotSettings((prev) => ({ ...prev, botRebalanceFrequency: value }))}
              >
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Profit Taking Strategy</Label>
              <Select
                value={botSettings.profitTakingStrategy}
                onValueChange={(value) => setBotSettings((prev) => ({ ...prev, profitTakingStrategy: value }))}
              >
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="fixed">Fixed Percentage</SelectItem>
                  <SelectItem value="trailing">Trailing Stop</SelectItem>
                  <SelectItem value="dynamic">Dynamic</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-white font-medium">Emergency Stop</p>
              <p className="text-sm text-gray-400">Automatically stop all bots during market crashes</p>
            </div>
            <Switch
              checked={botSettings.emergencyStopEnabled}
              onCheckedChange={(checked) => setBotSettings((prev) => ({ ...prev, emergencyStopEnabled: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Alert Settings */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alert Settings
          </CardTitle>
          <CardDescription className="text-gray-400">Configure your trading alerts and notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-white font-medium">Price Alerts</p>
                <p className="text-sm text-gray-400">Significant price movements</p>
              </div>
              <Switch
                checked={alertSettings.priceAlerts}
                onCheckedChange={(checked) => setAlertSettings((prev) => ({ ...prev, priceAlerts: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-white font-medium">Volume Alerts</p>
                <p className="text-sm text-gray-400">Unusual trading volume</p>
              </div>
              <Switch
                checked={alertSettings.volumeAlerts}
                onCheckedChange={(checked) => setAlertSettings((prev) => ({ ...prev, volumeAlerts: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-white font-medium">Technical Indicator Alerts</p>
                <p className="text-sm text-gray-400">RSI, MACD, and other indicators</p>
              </div>
              <Switch
                checked={alertSettings.technicalIndicatorAlerts}
                onCheckedChange={(checked) =>
                  setAlertSettings((prev) => ({ ...prev, technicalIndicatorAlerts: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-white font-medium">News-Based Alerts</p>
                <p className="text-sm text-gray-400">Market-moving news events</p>
              </div>
              <Switch
                checked={alertSettings.newsBasedAlerts}
                onCheckedChange={(checked) => setAlertSettings((prev) => ({ ...prev, newsBasedAlerts: checked }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Custom Alert Threshold (%)</Label>
            <div className="px-3">
              <Slider
                value={alertSettings.customAlertThreshold}
                onValueChange={(value) => setAlertSettings((prev) => ({ ...prev, customAlertThreshold: value }))}
                max={20}
                min={1}
                step={0.5}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-400 mt-1">
                <span>1%</span>
                <span className="text-white font-medium">{alertSettings.customAlertThreshold[0]}%</span>
                <span>20%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? "Saving..." : "Save Trading Preferences"}
        </Button>
      </div>
    </div>
  )
}
