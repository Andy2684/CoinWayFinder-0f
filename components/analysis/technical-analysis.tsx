"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, Minus, RefreshCw } from "lucide-react";

interface TechnicalIndicator {
  name: string;
  value: number;
  signal: "BUY" | "SELL" | "NEUTRAL";
  description: string;
}

interface PriceData {
  timestamp: string;
  price: number;
  volume: number;
  rsi: number;
  macd: number;
  bb_upper: number;
  bb_lower: number;
}

export function TechnicalAnalysis() {
  const [selectedCrypto, setSelectedCrypto] = useState("BTC");
  const [selectedTimeframe, setSelectedTimeframe] = useState("1h");
  const [indicators, setIndicators] = useState<TechnicalIndicator[]>([]);
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [overallSignal, setOverallSignal] = useState<
    "BUY" | "SELL" | "NEUTRAL"
  >("NEUTRAL");

  const cryptos = [
    { value: "BTC", label: "Bitcoin (BTC)" },
    { value: "ETH", label: "Ethereum (ETH)" },
    { value: "ADA", label: "Cardano (ADA)" },
    { value: "SOL", label: "Solana (SOL)" },
    { value: "DOT", label: "Polkadot (DOT)" },
  ];

  const timeframes = [
    { value: "5m", label: "5 Minutes" },
    { value: "15m", label: "15 Minutes" },
    { value: "1h", label: "1 Hour" },
    { value: "4h", label: "4 Hours" },
    { value: "1d", label: "1 Day" },
  ];

  const fetchTechnicalData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/analysis/technical?symbol=${selectedCrypto}&timeframe=${selectedTimeframe}`,
      );
      const data = await response.json();

      // Mock data for demonstration
      const mockIndicators: TechnicalIndicator[] = [
        {
          name: "RSI (14)",
          value: 65.4,
          signal: "NEUTRAL",
          description: "Relative Strength Index",
        },
        {
          name: "MACD",
          value: 0.0023,
          signal: "BUY",
          description: "Moving Average Convergence Divergence",
        },
        {
          name: "SMA (20)",
          value: 43250.5,
          signal: "BUY",
          description: "Simple Moving Average",
        },
        {
          name: "EMA (12)",
          value: 43180.2,
          signal: "BUY",
          description: "Exponential Moving Average",
        },
        {
          name: "Stochastic",
          value: 72.1,
          signal: "SELL",
          description: "Stochastic Oscillator",
        },
        {
          name: "Bollinger Bands",
          value: 0.85,
          signal: "NEUTRAL",
          description: "Price position in BB",
        },
      ];

      const mockPriceData: PriceData[] = Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(
          Date.now() - (23 - i) * 60 * 60 * 1000,
        ).toISOString(),
        price: 43000 + Math.random() * 2000 - 1000,
        volume: Math.random() * 1000000,
        rsi: 30 + Math.random() * 40,
        macd: -0.01 + Math.random() * 0.02,
        bb_upper: 44000 + Math.random() * 500,
        bb_lower: 42000 + Math.random() * 500,
      }));

      setIndicators(mockIndicators);
      setPriceData(mockPriceData);

      // Calculate overall signal
      const buySignals = mockIndicators.filter(
        (i) => i.signal === "BUY",
      ).length;
      const sellSignals = mockIndicators.filter(
        (i) => i.signal === "SELL",
      ).length;

      if (buySignals > sellSignals) {
        setOverallSignal("BUY");
      } else if (sellSignals > buySignals) {
        setOverallSignal("SELL");
      } else {
        setOverallSignal("NEUTRAL");
      }
    } catch (error) {
      console.error("Error fetching technical data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnicalData();
  }, [selectedCrypto, selectedTimeframe]);

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case "BUY":
        return "bg-green-100 text-green-800 border-green-200";
      case "SELL":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case "BUY":
        return <TrendingUp className="h-4 w-4" />;
      case "SELL":
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-4">
          <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select cryptocurrency" />
            </SelectTrigger>
            <SelectContent>
              {cryptos.map((crypto) => (
                <SelectItem key={crypto.value} value={crypto.value}>
                  {crypto.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedTimeframe}
            onValueChange={setSelectedTimeframe}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              {timeframes.map((timeframe) => (
                <SelectItem key={timeframe.value} value={timeframe.value}>
                  {timeframe.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={fetchTechnicalData}
          disabled={loading}
          variant="outline"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Price Chart with Indicators</CardTitle>
              <CardDescription>
                {selectedCrypto} price movement with technical indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={(value) =>
                        new Date(value).toLocaleTimeString()
                      }
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(value) =>
                        new Date(value).toLocaleString()
                      }
                      formatter={(value: number, name: string) => [
                        name === "price"
                          ? `$${value.toFixed(2)}`
                          : value.toFixed(4),
                        name.toUpperCase(),
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#2563eb"
                      strokeWidth={2}
                      name="price"
                    />
                    <Line
                      type="monotone"
                      dataKey="bb_upper"
                      stroke="#ef4444"
                      strokeDasharray="5 5"
                      name="bb_upper"
                    />
                    <Line
                      type="monotone"
                      dataKey="bb_lower"
                      stroke="#ef4444"
                      strokeDasharray="5 5"
                      name="bb_lower"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>RSI & MACD</CardTitle>
              <CardDescription>Momentum indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={(value) =>
                        new Date(value).toLocaleTimeString()
                      }
                    />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="rsi"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="RSI"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Overall Signal
                {getSignalIcon(overallSignal)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <Badge
                  className={`text-lg px-4 py-2 ${getSignalColor(overallSignal)}`}
                  variant="outline"
                >
                  {overallSignal}
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">
                  Based on {indicators.length} technical indicators
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Technical Indicators</CardTitle>
              <CardDescription>
                Current indicator values and signals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {indicators.map((indicator, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium">{indicator.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {indicator.description}
                    </div>
                    <div className="text-sm font-mono">{indicator.value}</div>
                  </div>
                  <Badge
                    className={getSignalColor(indicator.signal)}
                    variant="outline"
                  >
                    {indicator.signal}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
