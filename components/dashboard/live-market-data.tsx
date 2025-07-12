"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Volume2,
  Zap,
  RefreshCw,
} from "lucide-react";

interface MarketData {
  symbol: string;
  exchange: string;
  price: number;
  change24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  fundingRate?: number;
  openInterest?: number;
  liquidations?: number;
  lastUpdate: string;
}

export function LiveMarketData() {
  const [selectedExchange, setSelectedExchange] = useState("all");
  const [marketData, setMarketData] = useState<MarketData[]>([
    {
      symbol: "BTC/USDT",
      exchange: "Binance",
      price: 67234.56,
      change24h: 2.34,
      volume24h: 1234567890,
      high24h: 68500.0,
      low24h: 65800.0,
      fundingRate: 0.0001,
      openInterest: 2345678,
      liquidations: 1234567,
      lastUpdate: "2 seconds ago",
    },
    {
      symbol: "ETH/USDT",
      exchange: "Bybit",
      price: 3456.78,
      change24h: -1.23,
      volume24h: 987654321,
      high24h: 3520.0,
      low24h: 3380.0,
      fundingRate: -0.0002,
      openInterest: 1234567,
      liquidations: 987654,
      lastUpdate: "1 second ago",
    },
    {
      symbol: "SOL/USDT",
      exchange: "OKX",
      price: 156.78,
      change24h: 5.67,
      volume24h: 456789123,
      high24h: 162.0,
      low24h: 148.0,
      fundingRate: 0.0003,
      openInterest: 789123,
      liquidations: 456789,
      lastUpdate: "3 seconds ago",
    },
    {
      symbol: "ADA/USDT",
      exchange: "KuCoin",
      price: 0.4567,
      change24h: -2.45,
      volume24h: 234567890,
      high24h: 0.4789,
      low24h: 0.4321,
      lastUpdate: "1 second ago",
    },
    {
      symbol: "MATIC/USDT",
      exchange: "Coinbase",
      price: 0.8901,
      change24h: 3.21,
      volume24h: 123456789,
      high24h: 0.9234,
      low24h: 0.8567,
      lastUpdate: "2 seconds ago",
    },
  ]);

  const [lastRefresh, setLastRefresh] = useState(new Date());

  const refreshData = () => {
    // Simulate real-time data updates
    setMarketData((prevData) =>
      prevData.map((item) => ({
        ...item,
        price: item.price * (1 + (Math.random() - 0.5) * 0.001),
        change24h: item.change24h + (Math.random() - 0.5) * 0.1,
        lastUpdate: "Just now",
      })),
    );
    setLastRefresh(new Date());
  };

  useEffect(() => {
    const interval = setInterval(refreshData, 3000); // Update every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const filteredData =
    selectedExchange === "all"
      ? marketData
      : marketData.filter((item) => item.exchange === selectedExchange);

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(2)}K`;
    return `$${volume.toFixed(2)}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toFixed(2);
  };

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center">
            <Activity className="w-5 h-5 mr-2 text-[#30D5C8]" />
            Live Market Data
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Select
              value={selectedExchange}
              onValueChange={setSelectedExchange}
            >
              <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="all">All Exchanges</SelectItem>
                <SelectItem value="Binance">Binance</SelectItem>
                <SelectItem value="Bybit">Bybit</SelectItem>
                <SelectItem value="OKX">OKX</SelectItem>
                <SelectItem value="KuCoin">KuCoin</SelectItem>
                <SelectItem value="Coinbase">Coinbase</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshData}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-green-500/10 text-green-400">
            <Activity className="w-3 h-3 mr-1" />
            Live
          </Badge>
          <span className="text-xs text-gray-400">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {filteredData.map((item, index) => (
            <div
              key={index}
              className="p-4 bg-gray-800/30 rounded-lg border border-gray-700"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div>
                    <h4 className="text-white font-semibold">{item.symbol}</h4>
                    <p className="text-gray-400 text-sm">{item.exchange}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-white">
                    ${item.price.toFixed(2)}
                  </p>
                  <div className="flex items-center space-x-1">
                    {item.change24h > 0 ? (
                      <TrendingUp className="w-3 h-3 text-green-400" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-400" />
                    )}
                    <span
                      className={
                        item.change24h > 0 ? "text-green-400" : "text-red-400"
                      }
                    >
                      {item.change24h > 0 ? "+" : ""}
                      {item.change24h.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="flex items-center space-x-1 mb-1">
                    <Volume2 className="w-3 h-3 text-gray-400" />
                    <p className="text-xs text-gray-400">24h Volume</p>
                  </div>
                  <p className="text-sm text-white">
                    {formatVolume(item.volume24h)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 mb-1">24h High/Low</p>
                  <p className="text-sm text-white">
                    ${item.high24h.toFixed(2)} / ${item.low24h.toFixed(2)}
                  </p>
                </div>

                {item.fundingRate && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Funding Rate</p>
                    <p
                      className={`text-sm ${item.fundingRate > 0 ? "text-green-400" : "text-red-400"}`}
                    >
                      {(item.fundingRate * 100).toFixed(4)}%
                    </p>
                  </div>
                )}

                {item.openInterest && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Open Interest</p>
                    <p className="text-sm text-white">
                      ${formatNumber(item.openInterest)}
                    </p>
                  </div>
                )}
              </div>

              {item.liquidations && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Zap className="w-3 h-3 text-red-400" />
                      <p className="text-xs text-gray-400">24h Liquidations</p>
                    </div>
                    <p className="text-sm text-red-400">
                      ${formatNumber(item.liquidations)}
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-2 text-right">
                <span className="text-xs text-gray-500">{item.lastUpdate}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
