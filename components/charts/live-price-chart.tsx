"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import { TrendingUp, TrendingDown, Activity, FullscreenIcon, Settings } from "lucide-react"

interface PriceDataPoint {
  timestamp: number
  price: number
  volume: number
  time: string
}

interface LivePriceChartProps {
  symbol?: string
  height?: number
  showVolume?: boolean
}

export function LivePriceChart({ symbol = "BTC/USDT", height = 400, showVolume = true }: LivePriceChartProps) {
  const [timeframe, setTimeframe] = useState("1h")
  const [priceData, setPriceData] = useState<PriceDataPoint[]>([])
  const [currentPrice, setCurrentPrice] = useState(67234.56)
  const [priceChange, setPriceChange] = useState(2.34)
  const [isConnected, setIsConnected] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // Generate realistic price data
  useEffect(() => {
    const generateInitialData = () => {
      const now = Date.now()
      const data: PriceDataPoint[] = []
      let basePrice = 67000

      for (let i = 100; i >= 0; i--) {
        const timestamp = now - i * 60000 // 1 minute intervals
        const randomChange = (Math.random() - 0.5) * 100
        basePrice += randomChange

        data.push({
          timestamp,
          price: basePrice,
          volume: Math.random() * 1000000 + 500000,
          time: new Date(timestamp).toLocaleTimeString(),
        })
      }

      setPriceData(data)
      setCurrentPrice(basePrice)
    }

    generateInitialData()

    // Simulate real-time updates
    const interval = setInterval(() => {
      const now = Date.now()
      const randomChange = (Math.random() - 0.5) * 50
      const newPrice = currentPrice + randomChange
      const change = ((newPrice - currentPrice) / currentPrice) * 100

      setCurrentPrice(newPrice)
      setPriceChange(change)
      setLastUpdate(new Date())

      setPriceData((prevData) => {
        const newData = [...prevData]
        newData.shift() // Remove oldest
        newData.push({
          timestamp: now,
          price: newPrice,
          volume: Math.random() * 1000000 + 500000,
          time: new Date(now).toLocaleTimeString(),
        })
        return newData
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [currentPrice])

  const formatPrice = (value: number) => {
    return `$${value.toFixed(2)}`
  }

  const formatVolume = (value: number) => {
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`
    return value.toFixed(0)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-gray-300 text-sm">{`Time: ${label}`}</p>
          <p className="text-white font-semibold">{`Price: ${formatPrice(payload[0].value)}`}</p>
          {showVolume && payload[1] && (
            <p className="text-gray-400 text-sm">{`Volume: ${formatVolume(payload[1].value)}`}</p>
          )}
        </div>
      )
    }
    return null
  }

  const minPrice = Math.min(...priceData.map((d) => d.price))
  const maxPrice = Math.max(...priceData.map((d) => d.price))
  const avgPrice = (minPrice + maxPrice) / 2

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CardTitle className="text-white flex items-center">
              <Activity className="w-5 h-5 mr-2 text-[#30D5C8]" />
              {symbol} Live Chart
            </CardTitle>
            <Badge className={`${isConnected ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
              <Activity className="w-3 h-3 mr-1" />
              {isConnected ? "Live" : "Disconnected"}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-20 bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="1m">1m</SelectItem>
                <SelectItem value="5m">5m</SelectItem>
                <SelectItem value="15m">15m</SelectItem>
                <SelectItem value="1h">1h</SelectItem>
                <SelectItem value="4h">4h</SelectItem>
                <SelectItem value="1d">1d</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <FullscreenIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Price Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <p className="text-2xl font-bold text-white">{formatPrice(currentPrice)}</p>
              <div className="flex items-center space-x-1">
                {priceChange > 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )}
                <span className={priceChange > 0 ? "text-green-400" : "text-red-400"}>
                  {priceChange > 0 ? "+" : ""}
                  {priceChange.toFixed(2)}%
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">24h High/Low</p>
              <p className="text-sm text-white">
                {formatPrice(maxPrice)} / {formatPrice(minPrice)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Last updated: {lastUpdate.toLocaleTimeString()}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={priceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} tick={{ fill: "#9CA3AF" }} />
            <YAxis
              domain={["dataMin - 50", "dataMax + 50"]}
              stroke="#9CA3AF"
              fontSize={12}
              tick={{ fill: "#9CA3AF" }}
              tickFormatter={formatPrice}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Price trend line */}
            <Line
              type="monotone"
              dataKey="price"
              stroke="#30D5C8"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, stroke: "#30D5C8", strokeWidth: 2 }}
            />

            {/* Support/Resistance lines */}
            <ReferenceLine
              y={avgPrice}
              stroke="#6B7280"
              strokeDasharray="5 5"
              label={{ value: "Avg", position: "insideTopRight" }}
            />
            <ReferenceLine
              y={maxPrice}
              stroke="#EF4444"
              strokeDasharray="3 3"
              label={{ value: "Resistance", position: "insideTopRight" }}
            />
            <ReferenceLine
              y={minPrice}
              stroke="#10B981"
              strokeDasharray="3 3"
              label={{ value: "Support", position: "insideBottomRight" }}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Chart Controls */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-[#30D5C8] rounded-full"></div>
              <span className="text-sm text-gray-400">Price</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-500 rounded-full border-dashed border-2"></div>
              <span className="text-sm text-gray-400">Average</span>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            Range: {formatPrice(minPrice)} - {formatPrice(maxPrice)}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
