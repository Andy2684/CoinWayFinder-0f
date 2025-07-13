"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Zap, TrendingUp, Settings, Download, Upload, Bot, AlertTriangle, DollarSign } from "lucide-react"

export function QuickActions() {
  const [isCreateBotOpen, setIsCreateBotOpen] = useState(false)
  const [isQuickTradeOpen, setIsQuickTradeOpen] = useState(false)

  const quickStats = [
    { label: "Active Bots", value: "12", change: "+2", color: "text-[#30D5C8]" },
    { label: "Daily P&L", value: "+$1,247", change: "+8.2%", color: "text-green-400" },
    { label: "Win Rate", value: "73.4%", change: "+2.1%", color: "text-blue-400" },
    { label: "Risk Score", value: "Medium", change: "Stable", color: "text-yellow-400" },
  ]

  return (
    <section className="mb-8">
      {/* Quick Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {quickStats.map((stat, index) => (
          <div key={index} className="bg-gray-900/30 rounded-lg p-4 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">{stat.label}</p>
                <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
              </div>
              <span className="text-xs text-gray-500">{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader className="pb-4">
          <CardTitle className="text-white flex items-center">
            <Zap className="w-5 h-5 mr-2 text-[#30D5C8]" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {/* Create Bot */}
            <Dialog open={isCreateBotOpen} onOpenChange={setIsCreateBotOpen}>
              <DialogTrigger asChild>
                <Button className="h-20 flex-col bg-[#30D5C8]/10 hover:bg-[#30D5C8]/20 border border-[#30D5C8]/30 text-[#30D5C8]">
                  <Plus className="w-6 h-6 mb-2" />
                  <span className="text-xs">Create Bot</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-800 text-white">
                <DialogHeader>
                  <DialogTitle>Create New Trading Bot</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="bot-name">Bot Name</Label>
                    <Input id="bot-name" placeholder="My Trading Bot" className="bg-gray-800 border-gray-700" />
                  </div>
                  <div>
                    <Label htmlFor="strategy">Strategy</Label>
                    <Select>
                      <SelectTrigger className="bg-gray-800 border-gray-700">
                        <SelectValue placeholder="Select strategy" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-gray-700">
                        <SelectItem value="dca">DCA (Dollar Cost Average)</SelectItem>
                        <SelectItem value="grid">Grid Trading</SelectItem>
                        <SelectItem value="scalping">Scalping</SelectItem>
                        <SelectItem value="ai">AI Trend Following</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="exchange">Exchange</Label>
                    <Select>
                      <SelectTrigger className="bg-gray-800 border-gray-700">
                        <SelectValue placeholder="Select exchange" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-gray-700">
                        <SelectItem value="binance">Binance</SelectItem>
                        <SelectItem value="bybit">Bybit</SelectItem>
                        <SelectItem value="okx">OKX</SelectItem>
                        <SelectItem value="kucoin">KuCoin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex space-x-2">
                    <Button className="flex-1 bg-[#30D5C8] hover:bg-[#30D5C8]/90">Create Bot</Button>
                    <Button variant="outline" onClick={() => setIsCreateBotOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Quick Trade */}
            <Dialog open={isQuickTradeOpen} onOpenChange={setIsQuickTradeOpen}>
              <DialogTrigger asChild>
                <Button className="h-20 flex-col bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400">
                  <TrendingUp className="w-6 h-6 mb-2" />
                  <span className="text-xs">Quick Trade</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-800 text-white">
                <DialogHeader>
                  <DialogTitle>Quick Trade</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pair">Trading Pair</Label>
                      <Select>
                        <SelectTrigger className="bg-gray-800 border-gray-700">
                          <SelectValue placeholder="BTC/USDT" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-gray-700">
                          <SelectItem value="btc">BTC/USDT</SelectItem>
                          <SelectItem value="eth">ETH/USDT</SelectItem>
                          <SelectItem value="sol">SOL/USDT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="side">Side</Label>
                      <Select>
                        <SelectTrigger className="bg-gray-800 border-gray-700">
                          <SelectValue placeholder="Buy" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-gray-700">
                          <SelectItem value="buy">Buy</SelectItem>
                          <SelectItem value="sell">Sell</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="amount">Amount (USDT)</Label>
                    <Input id="amount" placeholder="100" className="bg-gray-800 border-gray-700" />
                  </div>
                  <div className="flex space-x-2">
                    <Button className="flex-1 bg-green-500 hover:bg-green-600">Execute Trade</Button>
                    <Button variant="outline" onClick={() => setIsQuickTradeOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Portfolio Rebalance */}
            <Button className="h-20 flex-col bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400">
              <Settings className="w-6 h-6 mb-2" />
              <span className="text-xs">Rebalance</span>
            </Button>

            {/* Export Data */}
            <Button className="h-20 flex-col bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400">
              <Download className="w-6 h-6 mb-2" />
              <span className="text-xs">Export</span>
            </Button>

            {/* Import Config */}
            <Button className="h-20 flex-col bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400">
              <Upload className="w-6 h-6 mb-2" />
              <span className="text-xs">Import</span>
            </Button>

            {/* Emergency Stop */}
            <Button className="h-20 flex-col bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400">
              <AlertTriangle className="w-6 h-6 mb-2" />
              <span className="text-xs">Stop All</span>
            </Button>
          </div>

          {/* Quick Alerts */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Badge className="bg-green-500/10 text-green-400">
                <Bot className="w-3 h-3 mr-1" />
                12 Bots Active
              </Badge>
              <Badge className="bg-blue-500/10 text-blue-400">
                <DollarSign className="w-3 h-3 mr-1" />
                $45,678 Portfolio
              </Badge>
              <Badge className="bg-yellow-500/10 text-yellow-400">
                <AlertTriangle className="w-3 h-3 mr-1" />2 Alerts
              </Badge>
            </div>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              View All Alerts
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
