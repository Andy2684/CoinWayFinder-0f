"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  Play,
  Pause,
  Settings,
  TrendingUp,
  TrendingDown,
  Bot,
  Zap,
  BarChart3,
  Target,
} from "lucide-react";

interface Strategy {
  id: string;
  name: string;
  type: "dca" | "grid" | "ai" | "trend" | "scalping";
  exchange: string;
  pair: string;
  status: "running" | "paused" | "stopped";
  profit: number;
  profitPercent: number;
  trades: number;
  winRate: number;
  allocation: number;
  maxAllocation: number;
  lastTrade: string;
  riskLevel: "Low" | "Medium" | "High";
}

export function ActiveStrategies() {
  const [strategies, setStrategies] = useState<Strategy[]>([
    {
      id: "1",
      name: "BTC DCA Pro",
      type: "dca",
      exchange: "Binance",
      pair: "BTC/USDT",
      status: "running",
      profit: 1247.32,
      profitPercent: 12.4,
      trades: 156,
      winRate: 78.2,
      allocation: 8500,
      maxAllocation: 10000,
      lastTrade: "2 hours ago",
      riskLevel: "Low",
    },
    {
      id: "2",
      name: "ETH Grid Master",
      type: "grid",
      exchange: "Bybit",
      pair: "ETH/USDT",
      status: "running",
      profit: 892.15,
      profitPercent: 17.8,
      trades: 234,
      winRate: 71.4,
      allocation: 4200,
      maxAllocation: 5000,
      lastTrade: "15 minutes ago",
      riskLevel: "Medium",
    },
    {
      id: "3",
      name: "AI Trend Follower",
      type: "ai",
      exchange: "OKX",
      pair: "SOL/USDT",
      status: "paused",
      profit: -45.67,
      profitPercent: -1.5,
      trades: 89,
      winRate: 65.2,
      allocation: 2800,
      maxAllocation: 3000,
      lastTrade: "1 day ago",
      riskLevel: "High",
    },
    {
      id: "4",
      name: "Multi-Pair Scalper",
      type: "scalping",
      exchange: "KuCoin",
      pair: "Multiple",
      status: "running",
      profit: 567.43,
      profitPercent: 22.7,
      trades: 445,
      winRate: 68.9,
      allocation: 2200,
      maxAllocation: 2500,
      lastTrade: "5 minutes ago",
      riskLevel: "High",
    },
  ]);

  const getStrategyIcon = (type: string) => {
    switch (type) {
      case "dca":
        return <TrendingUp className="w-4 h-4" />;
      case "grid":
        return <BarChart3 className="w-4 h-4" />;
      case "ai":
        return <Bot className="w-4 h-4" />;
      case "trend":
        return <Target className="w-4 h-4" />;
      case "scalping":
        return <Zap className="w-4 h-4" />;
      default:
        return <Bot className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-green-500/10 text-green-400";
      case "paused":
        return "bg-yellow-500/10 text-yellow-400";
      case "stopped":
        return "bg-red-500/10 text-red-400";
      default:
        return "bg-gray-500/10 text-gray-400";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low":
        return "bg-green-500/10 text-green-400";
      case "Medium":
        return "bg-yellow-500/10 text-yellow-400";
      case "High":
        return "bg-red-500/10 text-red-400";
      default:
        return "bg-gray-500/10 text-gray-400";
    }
  };

  const toggleStrategy = (strategyId: string) => {
    setStrategies(
      strategies.map((strategy) =>
        strategy.id === strategyId
          ? {
              ...strategy,
              status: strategy.status === "running" ? "paused" : "running",
            }
          : strategy,
      ),
    );
  };

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center">
            <Bot className="w-5 h-5 mr-2 text-[#30D5C8]" />
            Active Strategies
          </CardTitle>
          <Button className="bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-[#191A1E] font-semibold">
            Create Strategy
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {strategies.map((strategy) => (
          <div
            key={strategy.id}
            className="p-4 bg-gray-800/30 rounded-lg border border-gray-700"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#30D5C8]/10 rounded-lg flex items-center justify-center">
                  {getStrategyIcon(strategy.type)}
                </div>
                <div>
                  <h4 className="text-white font-semibold">{strategy.name}</h4>
                  <p className="text-gray-400 text-sm">
                    {strategy.exchange} • {strategy.pair}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={getStatusColor(strategy.status)}>
                  {strategy.status}
                </Badge>
                <Badge className={getRiskColor(strategy.riskLevel)}>
                  {strategy.riskLevel}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Profit/Loss</p>
                <div className="flex items-center space-x-2">
                  <p
                    className={`text-sm font-bold ${strategy.profit >= 0 ? "text-green-400" : "text-red-400"}`}
                  >
                    ${Math.abs(strategy.profit).toFixed(2)}
                  </p>
                  {strategy.profit >= 0 ? (
                    <TrendingUp className="w-3 h-3 text-green-400" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-400" />
                  )}
                </div>
                <p
                  className={`text-xs ${strategy.profitPercent >= 0 ? "text-green-400" : "text-red-400"}`}
                >
                  {strategy.profitPercent >= 0 ? "+" : ""}
                  {strategy.profitPercent}%
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">Win Rate</p>
                <p className="text-sm font-bold text-white">
                  {strategy.winRate}%
                </p>
                <p className="text-xs text-gray-400">
                  {strategy.trades} trades
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">Allocation</p>
                <p className="text-sm font-bold text-white">
                  ${strategy.allocation.toLocaleString()}
                </p>
                <Progress
                  value={(strategy.allocation / strategy.maxAllocation) * 100}
                  className="h-1 mt-1"
                  style={{ backgroundColor: "#374151" }}
                />
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">Last Trade</p>
                <p className="text-sm text-white">{strategy.lastTrade}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={strategy.status === "running"}
                  onCheckedChange={() => toggleStrategy(strategy.id)}
                />
                <span className="text-sm text-gray-300">
                  {strategy.status === "running" ? "Running" : "Paused"}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-gray-400 hover:text-white"
                >
                  <Settings className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-gray-400 hover:text-white"
                  onClick={() => toggleStrategy(strategy.id)}
                >
                  {strategy.status === "running" ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
