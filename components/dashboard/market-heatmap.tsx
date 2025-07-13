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
import { TrendingUp, TrendingDown, Thermometer } from "lucide-react";

interface MarketAsset {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  category: string;
}

export function MarketHeatmap() {
  const [timeframe, setTimeframe] = useState("24h");
  const [category, setCategory] = useState("all");

  const [marketData, setMarketData] = useState<MarketAsset[]>([
    {
      symbol: "BTC",
      name: "Bitcoin",
      price: 67234.56,
      change24h: 2.34,
      marketCap: 1200000000000,
      volume24h: 28000000000,
      category: "layer1",
    },
    {
      symbol: "ETH",
      name: "Ethereum",
      price: 3456.78,
      change24h: -1.23,
      marketCap: 400000000000,
      volume24h: 15000000000,
      category: "layer1",
    },
    {
      symbol: "SOL",
      name: "Solana",
      price: 156.78,
      change24h: 5.67,
      marketCap: 70000000000,
      volume24h: 3000000000,
      category: "layer1",
    },
    {
      symbol: "ADA",
      name: "Cardano",
      price: 0.4567,
      change24h: -2.45,
      marketCap: 16000000000,
      volume24h: 500000000,
      category: "layer1",
    },
    {
      symbol: "MATIC",
      name: "Polygon",
      price: 0.8901,
      change24h: 3.21,
      marketCap: 8000000000,
      volume24h: 400000000,
      category: "layer2",
    },
    {
      symbol: "LINK",
      name: "Chainlink",
      price: 14.56,
      change24h: 1.89,
      marketCap: 7500000000,
      volume24h: 350000000,
      category: "oracle",
    },
    {
      symbol: "UNI",
      name: "Uniswap",
      price: 8.45,
      change24h: 4.56,
      marketCap: 6000000000,
      volume24h: 200000000,
      category: "defi",
    },
    {
      symbol: "AAVE",
      name: "Aave",
      price: 89.12,
      change24h: -0.87,
      marketCap: 1300000000,
      volume24h: 120000000,
      category: "defi",
    },
    {
      symbol: "SAND",
      name: "Sandbox",
      price: 0.45,
      change24h: -3.21,
      marketCap: 850000000,
      volume24h: 80000000,
      category: "gaming",
    },
    {
      symbol: "MANA",
      name: "Decentraland",
      price: 0.38,
      change24h: 2.14,
      marketCap: 700000000,
      volume24h: 60000000,
      category: "gaming",
    },
    {
      symbol: "ENJ",
      name: "Enjin",
      price: 0.23,
      change24h: 1.75,
      marketCap: 200000000,
      volume24h: 25000000,
      category: "gaming",
    },
    {
      symbol: "CRV",
      name: "Curve",
      price: 0.67,
      change24h: -1.45,
      marketCap: 400000000,
      volume24h: 45000000,
      category: "defi",
    },
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketData((prevData) =>
        prevData.map((asset) => ({
          ...asset,
          change24h: asset.change24h + (Math.random() - 0.5) * 0.5,
        })),
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const filteredData =
    category === "all"
      ? marketData
      : marketData.filter((asset) => asset.category === category);

  const getHeatmapColor = (change: number) => {
    const intensity = Math.min(Math.abs(change) / 5, 1); // Normalize to 0-1
    if (change > 0) {
      return {
        backgroundColor: `rgba(16, 185, 129, ${intensity * 0.7})`,
        borderColor: `rgba(16, 185, 129, ${intensity})`,
        textColor: intensity > 0.5 ? "text-white" : "text-green-400",
      };
    } else {
      return {
        backgroundColor: `rgba(239, 68, 68, ${intensity * 0.7})`,
        borderColor: `rgba(239, 68, 68, ${intensity})`,
        textColor: intensity > 0.5 ? "text-white" : "text-red-400",
      };
    }
  };

  const formatMarketCap = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toFixed(2)}`;
  };

  const formatVolume = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  // Calculate grid dimensions based on market cap
  const getGridSize = (marketCap: number) => {
    if (marketCap >= 1e12) return "col-span-4 row-span-3"; // Largest
    if (marketCap >= 1e11) return "col-span-3 row-span-2"; // Large
    if (marketCap >= 1e10) return "col-span-2 row-span-2"; // Medium
    if (marketCap >= 1e9) return "col-span-2 row-span-1"; // Small-medium
    return "col-span-1 row-span-1"; // Small
  };

  const totalMarketCap = filteredData.reduce(
    (sum, asset) => sum + asset.marketCap,
    0,
  );
  const averageChange =
    filteredData.reduce((sum, asset) => sum + asset.change24h, 0) /
    filteredData.length;

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center">
            <Thermometer className="w-5 h-5 mr-2 text-[#30D5C8]" />
            Market Heatmap
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="all">All Assets</SelectItem>
                <SelectItem value="layer1">Layer 1</SelectItem>
                <SelectItem value="layer2">Layer 2</SelectItem>
                <SelectItem value="defi">DeFi</SelectItem>
                <SelectItem value="gaming">Gaming</SelectItem>
                <SelectItem value="oracle">Oracle</SelectItem>
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
                <SelectItem value="30d">30d</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Market Summary */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-700">
          <div className="flex items-center space-x-6">
            <div>
              <p className="text-sm text-gray-400">Total Market Cap</p>
              <p className="text-lg font-bold text-white">
                {formatMarketCap(totalMarketCap)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Average Change</p>
              <div className="flex items-center space-x-1">
                {averageChange >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )}
                <p
                  className={`text-lg font-bold ${averageChange >= 0 ? "text-green-400" : "text-red-400"}`}
                >
                  {averageChange >= 0 ? "+" : ""}
                  {averageChange.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
          <Badge className="bg-[#30D5C8]/10 text-[#30D5C8]">
            {filteredData.length} Assets
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Heatmap Grid */}
        <div
          className="grid grid-cols-8 gap-2 mb-6"
          style={{ minHeight: "400px" }}
        >
          {filteredData
            .sort((a, b) => b.marketCap - a.marketCap)
            .map((asset, index) => {
              const colors = getHeatmapColor(asset.change24h);
              const gridSize = getGridSize(asset.marketCap);

              return (
                <div
                  key={asset.symbol}
                  className={`${gridSize} p-3 rounded-lg border-2 hover:scale-105 transition-transform cursor-pointer`}
                  style={{
                    backgroundColor: colors.backgroundColor,
                    borderColor: colors.borderColor,
                  }}
                >
                  <div className="h-full flex flex-col justify-between">
                    <div>
                      <h4 className={`font-bold text-sm ${colors.textColor}`}>
                        {asset.symbol}
                      </h4>
                      <p className={`text-xs opacity-80 ${colors.textColor}`}>
                        {asset.name}
                      </p>
                    </div>

                    <div className="mt-2">
                      <p className={`text-lg font-bold ${colors.textColor}`}>
                        $
                        {asset.price < 1
                          ? asset.price.toFixed(4)
                          : asset.price.toFixed(2)}
                      </p>
                      <div
                        className={`flex items-center space-x-1 ${colors.textColor}`}
                      >
                        {asset.change24h >= 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        <span className="text-sm font-medium">
                          {asset.change24h >= 0 ? "+" : ""}
                          {asset.change24h.toFixed(2)}%
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 text-xs opacity-70">
                      <p className={colors.textColor}>
                        MC: {formatMarketCap(asset.marketCap)}
                      </p>
                      <p className={colors.textColor}>
                        Vol: {formatVolume(asset.volume24h)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center space-x-6 pt-4 border-t border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-400">Strong Positive</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500/50 rounded"></div>
            <span className="text-sm text-gray-400">Positive</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-600 rounded"></div>
            <span className="text-sm text-gray-400">Neutral</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500/50 rounded"></div>
            <span className="text-sm text-gray-400">Negative</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-400">Strong Negative</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
