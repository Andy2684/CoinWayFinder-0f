"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Volume2, TrendingUp, Activity } from "lucide-react";

interface VolumeData {
  time: string;
  totalVolume: number;
  buyVolume: number;
  sellVolume: number;
  price: number;
  trades: number;
}

interface ExchangeVolume {
  exchange: string;
  volume: number;
  percentage: number;
  color: string;
}

export function TradingVolumeChart() {
  const [selectedSymbol, setSelectedSymbol] = useState("BTC/USDT");
  const [timeframe, setTimeframe] = useState("24h");

  const [volumeData, setVolumeData] = useState<VolumeData[]>([
    {
      time: "00:00",
      totalVolume: 2345678,
      buyVolume: 1345678,
      sellVolume: 1000000,
      price: 65000,
      trades: 1234,
    },
    {
      time: "04:00",
      totalVolume: 3456789,
      buyVolume: 2000000,
      sellVolume: 1456789,
      price: 66200,
      trades: 1567,
    },
    {
      time: "08:00",
      totalVolume: 4567890,
      buyVolume: 2800000,
      sellVolume: 1767890,
      price: 67500,
      trades: 1890,
    },
    {
      time: "12:00",
      totalVolume: 5678901,
      buyVolume: 3200000,
      sellVolume: 2478901,
      price: 67800,
      trades: 2123,
    },
    {
      time: "16:00",
      totalVolume: 4234567,
      buyVolume: 2434567,
      sellVolume: 1800000,
      price: 68200,
      trades: 1789,
    },
    {
      time: "20:00",
      totalVolume: 3789012,
      buyVolume: 2189012,
      sellVolume: 1600000,
      price: 67900,
      trades: 1456,
    },
  ]);

  const exchangeVolumeData: ExchangeVolume[] = [
    {
      exchange: "Binance",
      volume: 12500000000,
      percentage: 35,
      color: "#F0B90B",
    },
    {
      exchange: "Coinbase",
      volume: 8900000000,
      percentage: 25,
      color: "#0052FF",
    },
    { exchange: "Bybit", volume: 7100000000, percentage: 20, color: "#FF6B35" },
    { exchange: "OKX", volume: 4200000000, percentage: 12, color: "#000000" },
    { exchange: "Others", volume: 2800000000, percentage: 8, color: "#6B7280" },
  ];

  // Calculate metrics
  const totalVolume24h = volumeData.reduce(
    (sum, item) => sum + item.totalVolume,
    0,
  );
  const totalBuyVolume = volumeData.reduce(
    (sum, item) => sum + item.buyVolume,
    0,
  );
  const totalSellVolume = volumeData.reduce(
    (sum, item) => sum + item.sellVolume,
    0,
  );
  const buyPressure =
    (totalBuyVolume / (totalBuyVolume + totalSellVolume)) * 100;
  const avgTrades =
    volumeData.reduce((sum, item) => sum + item.trades, 0) / volumeData.length;

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setVolumeData((prevData) => {
        const lastItem = prevData[prevData.length - 1];
        const newItem: VolumeData = {
          time: new Date().toLocaleTimeString(),
          totalVolume: lastItem.totalVolume * (1 + (Math.random() - 0.5) * 0.1),
          buyVolume: lastItem.buyVolume * (1 + (Math.random() - 0.5) * 0.1),
          sellVolume: lastItem.sellVolume * (1 + (Math.random() - 0.5) * 0.1),
          price: lastItem.price * (1 + (Math.random() - 0.5) * 0.01),
          trades: Math.floor(
            lastItem.trades * (1 + (Math.random() - 0.5) * 0.2),
          ),
        };

        return [...prevData.slice(-11), newItem]; // Keep last 12 points
      });
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const formatVolume = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* Volume Chart */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center">
              <Volume2 className="w-5 h-5 mr-2 text-[#30D5C8]" />
              Trading Volume Analysis
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="BTC/USDT">BTC/USDT</SelectItem>
                  <SelectItem value="ETH/USDT">ETH/USDT</SelectItem>
                  <SelectItem value="SOL/USDT">SOL/USDT</SelectItem>
                </SelectContent>
              </Select>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-20 bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="1h">1h</SelectItem>
                  <SelectItem value="24h">24h</SelectItem>
                  <SelectItem value="7d">7d</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Volume Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-700">
            <div className="text-center">
              <p className="text-sm text-gray-400">Total Volume</p>
              <p className="text-lg font-bold text-white">
                {formatVolume(totalVolume24h)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400">Buy Pressure</p>
              <p
                className={`text-lg font-bold ${buyPressure > 50 ? "text-green-400" : "text-red-400"}`}
              >
                {buyPressure.toFixed(1)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400">Avg Trades/Hour</p>
              <p className="text-lg font-bold text-white">
                {avgTrades.toFixed(0)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400">Status</p>
              <Badge className="bg-green-500/10 text-green-400">
                <Activity className="w-3 h-3 mr-1" />
                High Activity
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={volumeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
              <YAxis yAxisId="left" stroke="#9CA3AF" fontSize={12} />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#9CA3AF"
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                }}
              />
              <Bar
                yAxisId="left"
                dataKey="buyVolume"
                stackId="volume"
                fill="#10B981"
                fillOpacity={0.8}
              />
              <Bar
                yAxisId="left"
                dataKey="sellVolume"
                stackId="volume"
                fill="#EF4444"
                fillOpacity={0.8}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="price"
                stroke="#30D5C8"
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Exchange Volume Distribution */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader className="pb-4">
          <CardTitle className="text-white flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-[#30D5C8]" />
            Volume by Exchange
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={exchangeVolumeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={60}
                    paddingAngle={2}
                    dataKey="volume"
                  >
                    {exchangeVolumeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Exchange List */}
            <div className="space-y-4">
              {exchangeVolumeData.map((exchange, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: exchange.color }}
                    ></div>
                    <div>
                      <p className="text-white font-medium">
                        {exchange.exchange}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {exchange.percentage}% of total volume
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">
                      {formatVolume(exchange.volume)}
                    </p>
                    <Badge className="bg-[#30D5C8]/10 text-[#30D5C8] text-xs">
                      #{index + 1}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
