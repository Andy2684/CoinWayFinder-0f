"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  AreaChart,
  Area,
  ComposedChart,
  Bar,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  CandlestickChartIcon as CandlestickIcon,
  LineChartIcon,
  Target,
} from "lucide-react";

interface PriceData {
  timestamp: number;
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ma20: number;
  ma50: number;
  rsi: number;
  macd: number;
  signal: number;
}

interface TechnicalIndicator {
  name: string;
  value: number;
  signal: "buy" | "sell" | "neutral";
  color: string;
}

export function LivePriceCharts() {
  const [selectedSymbol, setSelectedSymbol] = useState("BTC/USDT");
  const [timeframe, setTimeframe] = useState("1h");
  const [chartType, setChartType] = useState("candlestick");
  const [showIndicators, setShowIndicators] = useState(true);
  const [isLive, setIsLive] = useState(true);

  // Sample data - replace with real WebSocket data
  const [priceData, setPriceData] = useState<PriceData[]>([
    {
      timestamp: Date.now() - 24 * 60 * 60 * 1000,
      time: "00:00",
      open: 65000,
      high: 66500,
      low: 64800,
      close: 66200,
      volume: 1234567,
      ma20: 65800,
      ma50: 65200,
      rsi: 68.5,
      macd: 245,
      signal: 180,
    },
    {
      timestamp: Date.now() - 23 * 60 * 60 * 1000,
      time: "01:00",
      open: 66200,
      high: 67100,
      low: 65900,
      close: 66800,
      volume: 1456789,
      ma20: 66000,
      ma50: 65400,
      rsi: 72.1,
      macd: 287,
      signal: 220,
    },
    {
      timestamp: Date.now() - 22 * 60 * 60 * 1000,
      time: "02:00",
      open: 66800,
      high: 67500,
      low: 66300,
      close: 67200,
      volume: 1345678,
      ma20: 66200,
      ma50: 65600,
      rsi: 75.3,
      macd: 325,
      signal: 265,
    },
    {
      timestamp: Date.now() - 21 * 60 * 60 * 1000,
      time: "03:00",
      open: 67200,
      high: 67800,
      low: 66700,
      close: 67500,
      volume: 1567890,
      ma20: 66400,
      ma50: 65800,
      rsi: 78.2,
      macd: 356,
      signal: 298,
    },
    {
      timestamp: Date.now() - 20 * 60 * 60 * 1000,
      time: "04:00",
      open: 67500,
      high: 68200,
      low: 67100,
      close: 67800,
      volume: 1678901,
      ma20: 66600,
      ma50: 66000,
      rsi: 81.4,
      macd: 387,
      signal: 332,
    },
  ]);

  const technicalIndicators: TechnicalIndicator[] = [
    { name: "RSI", value: 78.2, signal: "sell", color: "text-red-400" },
    { name: "MACD", value: 387, signal: "buy", color: "text-green-400" },
    { name: "Stoch", value: 82.1, signal: "sell", color: "text-red-400" },
    { name: "CCI", value: 145.3, signal: "buy", color: "text-green-400" },
    { name: "ADX", value: 68.7, signal: "neutral", color: "text-yellow-400" },
    {
      name: "Williams %R",
      value: -18.5,
      signal: "sell",
      color: "text-red-400",
    },
  ];

  // Simulate real-time updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setPriceData((prevData) => {
        const lastPoint = prevData[prevData.length - 1];
        const newPoint: PriceData = {
          timestamp: Date.now(),
          time: new Date().toLocaleTimeString(),
          open: lastPoint.close,
          high: lastPoint.close * (1 + Math.random() * 0.002),
          low: lastPoint.close * (1 - Math.random() * 0.002),
          close: lastPoint.close * (1 + (Math.random() - 0.5) * 0.001),
          volume: 1000000 + Math.random() * 500000,
          ma20: lastPoint.ma20 + (Math.random() - 0.5) * 10,
          ma50: lastPoint.ma50 + (Math.random() - 0.5) * 5,
          rsi: Math.max(
            0,
            Math.min(100, lastPoint.rsi + (Math.random() - 0.5) * 5),
          ),
          macd: lastPoint.macd + (Math.random() - 0.5) * 20,
          signal: lastPoint.signal + (Math.random() - 0.5) * 15,
        };

        return [...prevData.slice(-49), newPoint]; // Keep last 50 points
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isLive]);

  const latestPrice = priceData[priceData.length - 1];
  const priceChange = latestPrice ? latestPrice.close - latestPrice.open : 0;
  const priceChangePercent = latestPrice
    ? (priceChange / latestPrice.open) * 100
    : 0;

  const CandlestickData = ({ payload, x, y, width, height }: any) => {
    if (!payload) return null;

    const { open, high, low, close } = payload;
    const isRising = close > open;
    const color = isRising ? "#10B981" : "#EF4444";
    const bodyHeight = Math.abs(close - open);
    const bodyY = Math.min(open, close);

    return (
      <g>
        {/* Wick */}
        <line
          x1={x + width / 2}
          y1={high}
          x2={x + width / 2}
          y2={low}
          stroke={color}
          strokeWidth={1}
        />
        {/* Body */}
        <rect
          x={x + 1}
          y={bodyY}
          width={width - 2}
          height={bodyHeight || 1}
          fill={color}
        />
      </g>
    );
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="BTC/USDT">BTC/USDT</SelectItem>
                  <SelectItem value="ETH/USDT">ETH/USDT</SelectItem>
                  <SelectItem value="SOL/USDT">SOL/USDT</SelectItem>
                  <SelectItem value="ADA/USDT">ADA/USDT</SelectItem>
                </SelectContent>
              </Select>

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

              <div className="flex items-center space-x-2">
                <Button
                  variant={chartType === "line" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setChartType("line")}
                >
                  <LineChartIcon className="w-4 h-4" />
                </Button>
                <Button
                  variant={chartType === "candlestick" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setChartType("candlestick")}
                >
                  <CandlestickIcon className="w-4 h-4" />
                </Button>
                <Button
                  variant={chartType === "area" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setChartType("area")}
                >
                  <BarChart3 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Badge
                className={`${isLive ? "bg-green-500/10 text-green-400" : "bg-gray-500/10 text-gray-400"}`}
              >
                <Activity className="w-3 h-3 mr-1" />
                {isLive ? "Live" : "Paused"}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsLive(!isLive)}
              >
                {isLive ? "Pause" : "Resume"}
              </Button>
            </div>
          </div>

          {/* Price Info */}
          {latestPrice && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-700">
              <div className="flex items-center space-x-6">
                <div>
                  <p className="text-2xl font-bold text-white">
                    ${latestPrice.close.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-400">{selectedSymbol}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {priceChange >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                  <span
                    className={
                      priceChange >= 0 ? "text-green-400" : "text-red-400"
                    }
                  >
                    {priceChange >= 0 ? "+" : ""}
                    {priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-400">High</p>
                  <p className="text-sm text-white">
                    ${latestPrice.high.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Low</p>
                  <p className="text-sm text-white">
                    ${latestPrice.low.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Volume</p>
                  <p className="text-sm text-white">
                    {(latestPrice.volume / 1000000).toFixed(2)}M
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">RSI</p>
                  <p className="text-sm text-white">
                    {latestPrice.rsi.toFixed(1)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Main Chart */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="p-6">
          <Tabs defaultValue="price" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-800">
              <TabsTrigger value="price">Price Chart</TabsTrigger>
              <TabsTrigger value="volume">Volume</TabsTrigger>
              <TabsTrigger value="indicators">Indicators</TabsTrigger>
            </TabsList>

            <TabsContent value="price" className="space-y-4">
              <ResponsiveContainer width="100%" height={400}>
                {chartType === "line" && (
                  <LineChart data={priceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="close"
                      stroke="#30D5C8"
                      strokeWidth={2}
                      dot={false}
                    />
                    {showIndicators && (
                      <>
                        <Line
                          type="monotone"
                          dataKey="ma20"
                          stroke="#F59E0B"
                          strokeWidth={1}
                          dot={false}
                          strokeDasharray="5 5"
                        />
                        <Line
                          type="monotone"
                          dataKey="ma50"
                          stroke="#8B5CF6"
                          strokeWidth={1}
                          dot={false}
                          strokeDasharray="5 5"
                        />
                      </>
                    )}
                  </LineChart>
                )}

                {chartType === "area" && (
                  <AreaChart data={priceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="close"
                      stroke="#30D5C8"
                      fill="#30D5C8"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                )}

                {chartType === "candlestick" && (
                  <ComposedChart data={priceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar
                      dataKey="close"
                      fill="#30D5C8"
                      shape={<CandlestickData />}
                    />
                    {showIndicators && (
                      <>
                        <Line
                          type="monotone"
                          dataKey="ma20"
                          stroke="#F59E0B"
                          strokeWidth={1}
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="ma50"
                          stroke="#8B5CF6"
                          strokeWidth={1}
                          dot={false}
                        />
                      </>
                    )}
                  </ComposedChart>
                )}
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="volume" className="space-y-4">
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={priceData}>
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
                    dataKey="volume"
                    fill="#6B7280"
                    fillOpacity={0.6}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="close"
                    stroke="#30D5C8"
                    strokeWidth={2}
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="indicators" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* RSI Chart */}
                <div>
                  <h4 className="text-white font-medium mb-3">RSI (14)</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={priceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
                      <YAxis domain={[0, 100]} stroke="#9CA3AF" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                        }}
                      />
                      <ReferenceLine
                        y={70}
                        stroke="#EF4444"
                        strokeDasharray="3 3"
                      />
                      <ReferenceLine
                        y={30}
                        stroke="#10B981"
                        strokeDasharray="3 3"
                      />
                      <Line
                        type="monotone"
                        dataKey="rsi"
                        stroke="#8B5CF6"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* MACD Chart */}
                <div>
                  <h4 className="text-white font-medium mb-3">MACD</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={priceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
                      <YAxis stroke="#9CA3AF" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="macd"
                        stroke="#30D5C8"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="signal"
                        stroke="#F59E0B"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Technical Indicators Summary */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader className="pb-4">
          <CardTitle className="text-white flex items-center">
            <Target className="w-5 h-5 mr-2 text-[#30D5C8]" />
            Technical Analysis Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {technicalIndicators.map((indicator, index) => (
              <div
                key={index}
                className="text-center p-3 bg-gray-800/30 rounded-lg"
              >
                <p className="text-sm text-gray-400 mb-1">{indicator.name}</p>
                <p className={`text-lg font-bold ${indicator.color}`}>
                  {indicator.value}
                </p>
                <Badge
                  className={`text-xs mt-1 ${
                    indicator.signal === "buy"
                      ? "bg-green-500/10 text-green-400"
                      : indicator.signal === "sell"
                        ? "bg-red-500/10 text-red-400"
                        : "bg-yellow-500/10 text-yellow-400"
                  }`}
                >
                  {indicator.signal.toUpperCase()}
                </Badge>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gray-800/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium">Overall Signal</h4>
                <p className="text-gray-400 text-sm">
                  Based on 6 technical indicators
                </p>
              </div>
              <div className="text-center">
                <Badge className="bg-yellow-500/10 text-yellow-400 text-lg px-4 py-2">
                  NEUTRAL
                </Badge>
                <p className="text-xs text-gray-400 mt-1">
                  3 Buy • 2 Sell • 1 Neutral
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
