"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { X, Save } from "lucide-react"

export function SignalFilters() {
  const [filters, setFilters] = useState({
    symbols: [] as string[],
    strategies: [] as string[],
    exchanges: [] as string[],
    timeframes: [] as string[],
    riskLevels: [] as string[],
    confidenceRange: [70, 100],
    pnlRange: [-100, 100],
    status: "all",
  })

  const [savedFilters, setSavedFilters] = useState([
    { id: "1", name: "High Confidence BTC", count: 12 },
    { id: "2", name: "Scalping Signals", count: 8 },
    { id: "3", name: "Low Risk Only", count: 15 },
  ])

  const availableSymbols = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "ADA/USDT", "MATIC/USDT", "DOT/USDT"]
  const availableStrategies = [
    "AI Trend Following",
    "Mean Reversion",
    "Breakout Scalping",
    "Grid Trading",
    "DCA Accumulation",
    "Arbitrage",
  ]
  const availableExchanges = ["Binance", "Bybit", "KuCoin", "OKX", "Coinbase Pro", "Bitget"]
  const availableTimeframes = ["15M", "1H", "4H", "1D", "1W"]
  const availableRiskLevels = ["LOW", "MEDIUM", "HIGH"]

  const toggleArrayFilter = (category: keyof typeof filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [category]: (prev[category] as string[]).includes(value)
        ? (prev[category] as string[]).filter((item) => item !== value)
        : [...(prev[category] as string[]), value],
    }))
  }

  const clearFilters = () => {
    setFilters({
      symbols: [],
      strategies: [],
      exchanges: [],
      timeframes: [],
      riskLevels: [],
      confidenceRange: [70, 100],
      pnlRange: [-100, 100],
      status: "all",
    })
  }

  const saveCurrentFilter = () => {
    const filterName = prompt("Enter filter name:")
    if (filterName) {
      setSavedFilters((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          name: filterName,
          count: Math.floor(Math.random() * 20) + 1,
        },
      ])
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Advanced Filters</h3>
          <p className="text-sm text-muted-foreground">Fine-tune your signal search criteria</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={clearFilters}>
            <X className="h-4 w-4 mr-2" />
            Clear All
          </Button>
          <Button onClick={saveCurrentFilter}>
            <Save className="h-4 w-4 mr-2" />
            Save Filter
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Saved Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Saved Filters</CardTitle>
            <CardDescription>Quick access to your favorite filter combinations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {savedFilters.map((filter) => (
              <div
                key={filter.id}
                className="flex items-center justify-between p-2 border rounded hover:bg-muted cursor-pointer"
              >
                <div>
                  <p className="font-medium text-sm">{filter.name}</p>
                  <p className="text-xs text-muted-foreground">{filter.count} signals</p>
                </div>
                <Button variant="ghost" size="sm">
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Filter Categories */}
        <div className="lg:col-span-2 space-y-6">
          {/* Symbols */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Trading Pairs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {availableSymbols.map((symbol) => (
                  <div key={symbol} className="flex items-center space-x-2">
                    <Checkbox
                      id={`symbol-${symbol}`}
                      checked={filters.symbols.includes(symbol)}
                      onCheckedChange={() => toggleArrayFilter("symbols", symbol)}
                    />
                    <Label htmlFor={`symbol-${symbol}`} className="text-sm">
                      {symbol}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Strategies */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Trading Strategies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {availableStrategies.map((strategy) => (
                  <div key={strategy} className="flex items-center space-x-2">
                    <Checkbox
                      id={`strategy-${strategy}`}
                      checked={filters.strategies.includes(strategy)}
                      onCheckedChange={() => toggleArrayFilter("strategies", strategy)}
                    />
                    <Label htmlFor={`strategy-${strategy}`} className="text-sm">
                      {strategy}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Exchanges and Timeframes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Exchanges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {availableExchanges.map((exchange) => (
                    <div key={exchange} className="flex items-center space-x-2">
                      <Checkbox
                        id={`exchange-${exchange}`}
                        checked={filters.exchanges.includes(exchange)}
                        onCheckedChange={() => toggleArrayFilter("exchanges", exchange)}
                      />
                      <Label htmlFor={`exchange-${exchange}`} className="text-sm">
                        {exchange}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Timeframes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {availableTimeframes.map((timeframe) => (
                    <div key={timeframe} className="flex items-center space-x-2">
                      <Checkbox
                        id={`timeframe-${timeframe}`}
                        checked={filters.timeframes.includes(timeframe)}
                        onCheckedChange={() => toggleArrayFilter("timeframes", timeframe)}
                      />
                      <Label htmlFor={`timeframe-${timeframe}`} className="text-sm">
                        {timeframe}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risk Levels and Ranges */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Risk & Performance Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Risk Levels */}
              <div>
                <Label className="text-sm font-medium">Risk Levels</Label>
                <div className="flex space-x-4 mt-2">
                  {availableRiskLevels.map((risk) => (
                    <div key={risk} className="flex items-center space-x-2">
                      <Checkbox
                        id={`risk-${risk}`}
                        checked={filters.riskLevels.includes(risk)}
                        onCheckedChange={() => toggleArrayFilter("riskLevels", risk)}
                      />
                      <Label htmlFor={`risk-${risk}`} className="text-sm">
                        {risk}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Confidence Range */}
              <div>
                <Label className="text-sm font-medium">Confidence Range</Label>
                <div className="mt-4 px-2">
                  <Slider
                    value={filters.confidenceRange}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, confidenceRange: value }))}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{filters.confidenceRange[0]}%</span>
                    <span>{filters.confidenceRange[1]}%</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* P&L Range */}
              <div>
                <Label className="text-sm font-medium">P&L Range (%)</Label>
                <div className="mt-4 px-2">
                  <Slider
                    value={filters.pnlRange}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, pnlRange: value }))}
                    max={100}
                    min={-100}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{filters.pnlRange[0]}%</span>
                    <span>{filters.pnlRange[1]}%</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Signal Status */}
              <div>
                <Label className="text-sm font-medium">Signal Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Signals</SelectItem>
                    <SelectItem value="active">Active Only</SelectItem>
                    <SelectItem value="completed">Completed Only</SelectItem>
                    <SelectItem value="stopped">Stopped Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Active Filters Summary */}
          {(filters.symbols.length > 0 ||
            filters.strategies.length > 0 ||
            filters.exchanges.length > 0 ||
            filters.timeframes.length > 0 ||
            filters.riskLevels.length > 0 ||
            filters.status !== "all") && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Active Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {filters.symbols.map((symbol) => (
                    <Badge
                      key={symbol}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => toggleArrayFilter("symbols", symbol)}
                    >
                      {symbol} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                  {filters.strategies.map((strategy) => (
                    <Badge
                      key={strategy}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => toggleArrayFilter("strategies", strategy)}
                    >
                      {strategy} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                  {filters.exchanges.map((exchange) => (
                    <Badge
                      key={exchange}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => toggleArrayFilter("exchanges", exchange)}
                    >
                      {exchange} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                  {filters.timeframes.map((timeframe) => (
                    <Badge
                      key={timeframe}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => toggleArrayFilter("timeframes", timeframe)}
                    >
                      {timeframe} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                  {filters.riskLevels.map((risk) => (
                    <Badge
                      key={risk}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => toggleArrayFilter("riskLevels", risk)}
                    >
                      {risk} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                  {filters.status !== "all" && (
                    <Badge
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => setFilters((prev) => ({ ...prev, status: "all" }))}
                    >
                      Status: {filters.status} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
