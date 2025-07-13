"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Line } from "recharts"
import { Volume2, TrendingUp, Activity } from "lucide-react"

interface VolumeData {
  time: string
  volume: number
  buyVolume: number
  sellVolume: number
  price: number
  vwap: number
}

export function VolumeChart() {
  const [volumeData, setVolumeData] = useState<VolumeData[]>([])
  const [totalVolume, setTotalVolume] = useState(0)
  const [volumeChange, setVolumeChange] = useState(0)

  useEffect(() => {
    // Generate realistic volume data
    const generateVolumeData = () => {
      const data: VolumeData[] = []
      let basePrice = 67000
      let totalVol = 0

      for (let i = 24; i >= 0; i--) {
        const hour = new Date(Date.now() - i * 3600000)
        const volume = Math.random() * 2000000 + 500000
        const buyRatio = 0.4 + Math.random() * 0.2 // 40-60% buy volume
        const buyVolume = volume * buyRatio
        const sellVolume = volume * (1 - buyRatio)

        basePrice += (Math.random() - 0.5) * 200

        data.push({
          time: hour.getHours().toString().padStart(2, "0") + ":00",
          volume,
          buyVolume,
          sellVolume,
          price: basePrice,
          vwap: basePrice + (Math.random() - 0.5) * 100,
        })

        totalVol += volume
      }

      setVolumeData(data)
      setTotalVolume(totalVol)
      setVolumeChange(Math.random() * 20 - 10) // -10% to +10%
    }

    generateVolumeData()

    // Update every 30 seconds
    const interval = setInterval(() => {
      setVolumeData((prevData) => {
        const newData = [...prevData]
        newData.shift()

        const lastPrice = newData[newData.length - 1]?.price || 67000
        const newPrice = lastPrice + (Math.random() - 0.5) * 100
        const volume = Math.random() * 2000000 + 500000
        const buyRatio = 0.4 + Math.random() * 0.2

        newData.push({
          time: new Date().getHours().toString().padStart(2, "0") + ":00",
          volume,
          buyVolume: volume * buyRatio,
          sellVolume: volume * (1 - buyRatio),
          price: newPrice,
          vwap: newPrice + (Math.random() - 0.5) * 100,
        })

        return newData
      })
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const formatVolume = (value: number) => {
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`
    return value.toFixed(0)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-gray-300 text-sm">{`Time: ${label}`}</p>
          <p className="text-white font-semibold">{`Total Volume: ${formatVolume(data.volume)}`}</p>
          <p className="text-green-400 text-sm">{`Buy Volume: ${formatVolume(data.buyVolume)}`}</p>
          <p className="text-red-400 text-sm">{`Sell Volume: ${formatVolume(data.sellVolume)}`}</p>
          <p className="text-gray-400 text-sm">{`VWAP: $${data.vwap.toFixed(2)}`}</p>
        </div>
      )
    }
    return null
  }

  const avgVolume = volumeData.reduce((sum, data) => sum + data.volume, 0) / volumeData.length

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center">
            <Volume2 className="w-5 h-5 mr-2 text-[#30D5C8]" />
            Volume Analysis
          </CardTitle>
          <Badge className="bg-blue-500/10 text-blue-400">
            <Activity className="w-3 h-3 mr-1" />
            24h Data
          </Badge>
        </div>

        {/* Volume Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-800/30 rounded-lg">
            <Volume2 className="w-5 h-5 text-[#30D5C8] mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{formatVolume(totalVolume)}</p>
            <p className="text-xs text-gray-400">24h Volume</p>
          </div>
          <div className="text-center p-3 bg-gray-800/30 rounded-lg">
            <TrendingUp className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <p className={`text-lg font-bold ${volumeChange > 0 ? "text-green-400" : "text-red-400"}`}>
              {volumeChange > 0 ? "+" : ""}
              {volumeChange.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-400">Volume Change</p>
          </div>
          <div className="text-center p-3 bg-gray-800/30 rounded-lg">
            <div className="w-5 h-5 bg-green-500 rounded mx-auto mb-1"></div>
            <p className="text-lg font-bold text-white">{formatVolume(avgVolume)}</p>
            <p className="text-xs text-gray-400">Avg Volume</p>
          </div>
          <div className="text-center p-3 bg-gray-800/30 rounded-lg">
            <div className="w-5 h-5 bg-purple-500 rounded mx-auto mb-1"></div>
            <p className="text-lg font-bold text-white">$67,234</p>
            <p className="text-xs text-gray-400">VWAP</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={volumeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} tick={{ fill: "#9CA3AF" }} />
            <YAxis
              yAxisId="volume"
              stroke="#9CA3AF"
              fontSize={12}
              tick={{ fill: "#9CA3AF" }}
              tickFormatter={formatVolume}
            />
            <YAxis
              yAxisId="price"
              orientation="right"
              stroke="#9CA3AF"
              fontSize={12}
              tick={{ fill: "#9CA3AF" }}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Buy Volume */}
            <Bar yAxisId="volume" dataKey="buyVolume" stackId="volume" fill="#10B981" name="Buy Volume" />

            {/* Sell Volume */}
            <Bar yAxisId="volume" dataKey="sellVolume" stackId="volume" fill="#EF4444" name="Sell Volume" />

            {/* VWAP Line */}
            <Line
              yAxisId="price"
              type="monotone"
              dataKey="vwap"
              stroke="#A855F7"
              strokeWidth={2}
              dot={false}
              name="VWAP"
            />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex items-center justify-center space-x-6 mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-400">Buy Volume</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-400">Sell Volume</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-1 bg-purple-500 rounded"></div>
            <span className="text-sm text-gray-400">VWAP</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
