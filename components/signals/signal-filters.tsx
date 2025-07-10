"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Filter, X, ChevronDown, ChevronUp, Search, Bookmark, BookmarkPlus } from "lucide-react"

interface FilterProps {
  filters: {
    symbols: string[]
    strategies: string[]
    exchanges: string[]
    timeframes: string[]
    confidenceRange: number[]
    pnlRange: number[]
    riskLevels: string[]
  }
  onFiltersChange: (filters: any) => void
}

export function SignalFilters({ filters, onFiltersChange }: FilterProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedSections, setExpandedSections] = useState({
    symbols: true,
    strategies: true,
    exchanges: false,
    timeframes: false,
    advanced: false,
  })

  const [savedFilters] = useState([
    { name: "High Confidence BTC", count: 12 },
    { name: "Scalping Signals", count: 8 },
    { name: "Swing Trading", count: 15 },
  ])

  const symbols = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "ADA/USDT", "MATIC/USDT", "LINK/USDT", "DOT/USDT", "AVAX/USDT"]
  const strategies = ["Trend Following", "Mean Reversion", "Breakout", "Support/Resistance", "Momentum", "Scalping"]
  const exchanges = ["Binance", "Bybit", "KuCoin", "OKX", "Bitget", "Gate.io"]
  const timeframes = ["15M", "30M", "1H", "2H", "4H", "1D"]
  const riskLevels = ["LOW", "MEDIUM", "HIGH"]

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const updateFilter = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  const toggleArrayFilter = (key: string, value: string) => {
    const currentArray = filters[key] || []
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value]

    updateFilter(key, newArray)
  }

  const clearAllFilters = () => {
    onFiltersChange({
      symbols: [],
      strategies: [],
      exchanges: [],
      timeframes: [],
      confidenceRange: [0, 100],
      pnlRange: [-100, 100],
      riskLevels: [],
    })
    setSearchTerm("")
  }

  const getActiveFilterCount = () => {
    return (
      filters.symbols.length +
      filters.strategies.length +
      filters.exchanges.length +
      filters.timeframes.length +
      filters.riskLevels.length +
      (filters.confidenceRange[0] !== 0 || filters.confidenceRange[1] !== 100 ? 1 : 0) +
      (filters.pnlRange[0] !== -100 || filters.pnlRange[1] !== 100 ? 1 : 0)
    )
  }

  return (
    <Card className="bg-[#1A1B23] border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="bg-[#30D5C8] text-[#191A1E]">
                {getActiveFilterCount()}
              </Badge>
            )}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            Clear All
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search symbols..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-[#0F1015] border-gray-700"
          />
        </div>

        {/* Saved Filters */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-sm font-medium text-gray-300">Saved Filters</Label>
            <Button variant="ghost" size="sm">
              <BookmarkPlus className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {savedFilters.map((saved, index) => (
              <Button key={index} variant="ghost" size="sm" className="w-full justify-between text-left h-auto p-2">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-[#30D5C8]" />
                  <span className="text-sm">{saved.name}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {saved.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Active Filters */}
        {getActiveFilterCount() > 0 && (
          <div>
            <Label className="text-sm font-medium text-gray-300 mb-3 block">Active Filters</Label>
            <div className="flex flex-wrap gap-2">
              {filters.symbols.map((symbol) => (
                <Badge key={symbol} variant="secondary" className="bg-[#30D5C8]/20 text-[#30D5C8]">
                  {symbol}
                  <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => toggleArrayFilter("symbols", symbol)} />
                </Badge>
              ))}
              {filters.strategies.map((strategy) => (
                <Badge key={strategy} variant="secondary" className="bg-blue-500/20 text-blue-400">
                  {strategy}
                  <X
                    className="w-3 h-3 ml-1 cursor-pointer"
                    onClick={() => toggleArrayFilter("strategies", strategy)}
                  />
                </Badge>
              ))}
              {filters.riskLevels.map((risk) => (
                <Badge key={risk} variant="secondary" className="bg-yellow-500/20 text-yellow-400">
                  {risk}
                  <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => toggleArrayFilter("riskLevels", risk)} />
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Symbols */}
        <Collapsible open={expandedSections.symbols} onOpenChange={() => toggleSection("symbols")}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <Label className="text-sm font-medium text-gray-300">Symbols</Label>
              {expandedSections.symbols ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 mt-3">
            {symbols
              .filter((symbol) => symbol.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((symbol) => (
                <div key={symbol} className="flex items-center space-x-2">
                  <Checkbox
                    id={symbol}
                    checked={filters.symbols.includes(symbol)}
                    onCheckedChange={() => toggleArrayFilter("symbols", symbol)}
                  />
                  <Label htmlFor={symbol} className="text-sm text-gray-300 cursor-pointer">
                    {symbol}
                  </Label>
                </div>
              ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Strategies */}
        <Collapsible open={expandedSections.strategies} onOpenChange={() => toggleSection("strategies")}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <Label className="text-sm font-medium text-gray-300">Strategies</Label>
              {expandedSections.strategies ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 mt-3">
            {strategies.map((strategy) => (
              <div key={strategy} className="flex items-center space-x-2">
                <Checkbox
                  id={strategy}
                  checked={filters.strategies.includes(strategy)}
                  onCheckedChange={() => toggleArrayFilter("strategies", strategy)}
                />
                <Label htmlFor={strategy} className="text-sm text-gray-300 cursor-pointer">
                  {strategy}
                </Label>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Exchanges */}
        <Collapsible open={expandedSections.exchanges} onOpenChange={() => toggleSection("exchanges")}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <Label className="text-sm font-medium text-gray-300">Exchanges</Label>
              {expandedSections.exchanges ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 mt-3">
            {exchanges.map((exchange) => (
              <div key={exchange} className="flex items-center space-x-2">
                <Checkbox
                  id={exchange}
                  checked={filters.exchanges.includes(exchange)}
                  onCheckedChange={() => toggleArrayFilter("exchanges", exchange)}
                />
                <Label htmlFor={exchange} className="text-sm text-gray-300 cursor-pointer">
                  {exchange}
                </Label>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Timeframes */}
        <Collapsible open={expandedSections.timeframes} onOpenChange={() => toggleSection("timeframes")}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <Label className="text-sm font-medium text-gray-300">Timeframes</Label>
              {expandedSections.timeframes ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 mt-3">
            {timeframes.map((timeframe) => (
              <div key={timeframe} className="flex items-center space-x-2">
                <Checkbox
                  id={timeframe}
                  checked={filters.timeframes.includes(timeframe)}
                  onCheckedChange={() => toggleArrayFilter("timeframes", timeframe)}
                />
                <Label htmlFor={timeframe} className="text-sm text-gray-300 cursor-pointer">
                  {timeframe}
                </Label>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Risk Levels */}
        <div>
          <Label className="text-sm font-medium text-gray-300 mb-3 block">Risk Level</Label>
          <div className="space-y-2">
            {riskLevels.map((risk) => (
              <div key={risk} className="flex items-center space-x-2">
                <Checkbox
                  id={risk}
                  checked={filters.riskLevels.includes(risk)}
                  onCheckedChange={() => toggleArrayFilter("riskLevels", risk)}
                />
                <Label htmlFor={risk} className="text-sm text-gray-300 cursor-pointer">
                  {risk}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Advanced Filters */}
        <Collapsible open={expandedSections.advanced} onOpenChange={() => toggleSection("advanced")}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <Label className="text-sm font-medium text-gray-300">Advanced</Label>
              {expandedSections.advanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-3">
            {/* Confidence Range */}
            <div>
              <Label className="text-sm font-medium text-gray-300 mb-2 block">
                Confidence: {filters.confidenceRange[0]}% - {filters.confidenceRange[1]}%
              </Label>
              <Slider
                value={filters.confidenceRange}
                onValueChange={(value) => updateFilter("confidenceRange", value)}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
            </div>

            {/* P&L Range */}
            <div>
              <Label className="text-sm font-medium text-gray-300 mb-2 block">
                P&L: {filters.pnlRange[0]}% - {filters.pnlRange[1]}%
              </Label>
              <Slider
                value={filters.pnlRange}
                onValueChange={(value) => updateFilter("pnlRange", value)}
                max={100}
                min={-100}
                step={5}
                className="w-full"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}
