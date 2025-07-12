"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Play,
  Pause,
  TrendingUp,
  TrendingDown,
  Zap,
  Brain,
  Target,
  DollarSign,
} from "lucide-react";

interface AutomatedSignal {
  id: string;
  strategy: string;
  symbol: string;
  type: "BUY" | "SELL";
  confidence: number;
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  currentPrice: number;
  status: "PENDING" | "EXECUTED" | "CANCELLED" | "COMPLETED";
  executionTime?: string;
  pnl?: number;
  pnlPercentage?: number;
  riskScore: number;
  volume: number;
  timeframe: string;
  indicators: {
    rsi: number;
    macd: number;
    bollinger: string;
    volume: string;
    momentum: string;
  };
  aiAnalysis: string;
  createdAt: string;
  executedAt?: string;
}

interface StrategyConfig {
  id: string;
  name: string;
  enabled: boolean;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  minConfidence: number;
  maxPositionSize: number;
  symbols: string[];
  timeframes: string[];
  parameters: Record<string, any>;
}

export function AutomatedSignals() {
  const [signals, setSignals] = useState<AutomatedSignal[]>([]);
  const [strategies, setStrategies] = useState<StrategyConfig[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [executionEnabled, setExecutionEnabled] = useState(false);

  // Mock data initialization
  useEffect(() => {
    const mockStrategies: StrategyConfig[] = [
      {
        id: "rsi-divergence",
        name: "RSI Divergence",
        enabled: true,
        riskLevel: "MEDIUM",
        minConfidence: 75,
        maxPositionSize: 1000,
        symbols: ["BTC/USDT", "ETH/USDT", "BNB/USDT"],
        timeframes: ["1h", "4h"],
        parameters: {
          rsiPeriod: 14,
          divergenceLookback: 20,
          minRsiLevel: 30,
          maxRsiLevel: 70,
        },
      },
      {
        id: "macd-crossover",
        name: "MACD Crossover",
        enabled: true,
        riskLevel: "LOW",
        minConfidence: 80,
        maxPositionSize: 500,
        symbols: ["BTC/USDT", "ETH/USDT"],
        timeframes: ["4h", "1d"],
        parameters: {
          fastPeriod: 12,
          slowPeriod: 26,
          signalPeriod: 9,
          minHistogramValue: 0.1,
        },
      },
      {
        id: "bollinger-squeeze",
        name: "Bollinger Band Squeeze",
        enabled: false,
        riskLevel: "HIGH",
        minConfidence: 70,
        maxPositionSize: 2000,
        symbols: ["BTC/USDT", "ETH/USDT", "SOL/USDT", "ADA/USDT"],
        timeframes: ["1h", "2h"],
        parameters: {
          period: 20,
          stdDev: 2,
          squeezeThreshold: 0.1,
        },
      },
      {
        id: "ai-pattern",
        name: "AI Pattern Recognition",
        enabled: true,
        riskLevel: "MEDIUM",
        minConfidence: 85,
        maxPositionSize: 1500,
        symbols: ["BTC/USDT", "ETH/USDT", "SOL/USDT"],
        timeframes: ["1h", "4h", "1d"],
        parameters: {
          modelVersion: "v2.1",
          patternTypes: ["head-shoulders", "triangle", "flag"],
          minPatternStrength: 0.7,
        },
      },
    ];

    const mockSignals: AutomatedSignal[] = [
      {
        id: "1",
        strategy: "RSI Divergence",
        symbol: "BTC/USDT",
        type: "BUY",
        confidence: 87,
        entryPrice: 43250,
        targetPrice: 45800,
        stopLoss: 41900,
        currentPrice: 44120,
        status: "EXECUTED",
        executionTime: "2024-01-15T10:30:00Z",
        pnl: 870,
        pnlPercentage: 2.01,
        riskScore: 6.5,
        volume: 1250000,
        timeframe: "4h",
        indicators: {
          rsi: 32.5,
          macd: 0.15,
          bollinger: "Lower Band",
          volume: "Above Average",
          momentum: "Bullish",
        },
        aiAnalysis:
          "Strong bullish divergence detected on RSI with price making lower lows while RSI makes higher lows. Volume confirmation present.",
        createdAt: "2024-01-15T10:25:00Z",
        executedAt: "2024-01-15T10:30:00Z",
      },
      {
        id: "2",
        strategy: "MACD Crossover",
        symbol: "ETH/USDT",
        type: "SELL",
        confidence: 92,
        entryPrice: 2580,
        targetPrice: 2420,
        stopLoss: 2650,
        currentPrice: 2510,
        status: "EXECUTED",
        executionTime: "2024-01-15T09:15:00Z",
        pnl: 70,
        pnlPercentage: 2.71,
        riskScore: 4.2,
        volume: 890000,
        timeframe: "4h",
        indicators: {
          rsi: 68.2,
          macd: -0.08,
          bollinger: "Upper Band",
          volume: "High",
          momentum: "Bearish",
        },
        aiAnalysis:
          "MACD bearish crossover confirmed with histogram turning negative. RSI showing overbought conditions.",
        createdAt: "2024-01-15T09:10:00Z",
        executedAt: "2024-01-15T09:15:00Z",
      },
      {
        id: "3",
        strategy: "AI Pattern Recognition",
        symbol: "SOL/USDT",
        type: "BUY",
        confidence: 89,
        entryPrice: 98.5,
        targetPrice: 105.2,
        stopLoss: 95.8,
        currentPrice: 98.5,
        status: "PENDING",
        riskScore: 7.1,
        volume: 2100000,
        timeframe: "1h",
        indicators: {
          rsi: 45.8,
          macd: 0.05,
          bollinger: "Middle Band",
          volume: "Increasing",
          momentum: "Neutral",
        },
        aiAnalysis:
          "AI detected ascending triangle pattern with 89% confidence. Breakout expected within next 2-4 hours.",
        createdAt: "2024-01-15T11:45:00Z",
      },
    ];

    setStrategies(mockStrategies);
    setSignals(mockSignals);
  }, []);

  const toggleStrategy = (strategyId: string) => {
    setStrategies((prev) =>
      prev.map((strategy) =>
        strategy.id === strategyId
          ? { ...strategy, enabled: !strategy.enabled }
          : strategy,
      ),
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "EXECUTED":
        return "text-green-400 bg-green-400/10";
      case "PENDING":
        return "text-yellow-400 bg-yellow-400/10";
      case "CANCELLED":
        return "text-red-400 bg-red-400/10";
      case "COMPLETED":
        return "text-blue-400 bg-blue-400/10";
      default:
        return "text-gray-400 bg-gray-400/10";
    }
  };

  const getRiskColor = (risk: number) => {
    if (risk <= 3) return "text-green-400";
    if (risk <= 7) return "text-yellow-400";
    return "text-red-400";
  };

  const activeSignals = signals.filter(
    (s) => s.status === "EXECUTED" || s.status === "PENDING",
  );
  const completedSignals = signals.filter(
    (s) => s.status === "COMPLETED" || s.status === "CANCELLED",
  );
  const totalPnL = signals.reduce((sum, signal) => sum + (signal.pnl || 0), 0);
  const winRate =
    (signals.filter((s) => (s.pnl || 0) > 0).length /
      Math.max(signals.length, 1)) *
    100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            🤖 Automated Signals
          </h1>
          <p className="text-gray-300">
            AI-powered signal generation and automated execution
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={executionEnabled}
              onCheckedChange={setExecutionEnabled}
            />
            <span className="text-sm text-gray-300">Auto Execute</span>
          </div>
          <Button
            className="bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-[#191A1E]"
            onClick={() => setIsGenerating(!isGenerating)}
          >
            {isGenerating ? (
              <Pause className="w-4 h-4 mr-2" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            {isGenerating ? "Pause Generation" : "Start Generation"}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-[#1A1B23] border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Active Signals</p>
                <p className="text-2xl font-bold text-white">
                  {activeSignals.length}
                </p>
              </div>
              <Zap className="w-8 h-8 text-[#30D5C8]" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1B23] border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total P&L</p>
                <p
                  className={`text-2xl font-bold ${totalPnL >= 0 ? "text-green-400" : "text-red-400"}`}
                >
                  {totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1B23] border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Win Rate</p>
                <p className="text-2xl font-bold text-white">
                  {winRate.toFixed(1)}%
                </p>
              </div>
              <Target className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1B23] border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Strategies Active</p>
                <p className="text-2xl font-bold text-white">
                  {strategies.filter((s) => s.enabled).length}/
                  {strategies.length}
                </p>
              </div>
              <Brain className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="signals" className="space-y-6">
        <TabsList className="bg-[#1A1B23] border-gray-800">
          <TabsTrigger value="signals">Active Signals</TabsTrigger>
          <TabsTrigger value="strategies">Strategy Config</TabsTrigger>
          <TabsTrigger value="history">Signal History</TabsTrigger>
        </TabsList>

        <TabsContent value="signals" className="space-y-4">
          {activeSignals.map((signal) => (
            <Card key={signal.id} className="bg-[#1A1B23] border-gray-800">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {signal.type === "BUY" ? (
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-400" />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {signal.symbol}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {signal.strategy} • {signal.timeframe}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(signal.status)}>
                      {signal.status}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-[#30D5C8] border-[#30D5C8]/30"
                    >
                      {signal.confidence}%
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Price Information */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Entry Price</p>
                    <p className="text-sm font-medium text-white">
                      ${signal.entryPrice.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Current Price</p>
                    <p className="text-sm font-medium text-white">
                      ${signal.currentPrice.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Target</p>
                    <p className="text-sm font-medium text-green-400">
                      ${signal.targetPrice.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Stop Loss</p>
                    <p className="text-sm font-medium text-red-400">
                      ${signal.stopLoss.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Technical Indicators */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-[#0F1015] rounded-lg">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">RSI</p>
                    <p className="text-sm font-medium text-white">
                      {signal.indicators.rsi}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">MACD</p>
                    <p className="text-sm font-medium text-white">
                      {signal.indicators.macd}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Bollinger</p>
                    <p className="text-sm font-medium text-white">
                      {signal.indicators.bollinger}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Volume</p>
                    <p className="text-sm font-medium text-white">
                      {signal.indicators.volume}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Risk Score</p>
                    <p
                      className={`text-sm font-medium ${getRiskColor(signal.riskScore)}`}
                    >
                      {signal.riskScore}/10
                    </p>
                  </div>
                </div>

                {/* P&L if executed */}
                {signal.pnl !== undefined && (
                  <div className="flex items-center justify-between p-3 bg-[#0F1015] rounded-lg">
                    <div>
                      <p className="text-xs text-gray-400">Current P&L</p>
                      <p
                        className={`text-lg font-bold ${signal.pnl >= 0 ? "text-green-400" : "text-red-400"}`}
                      >
                        {signal.pnl >= 0 ? "+" : ""}${signal.pnl.toFixed(2)} (
                        {signal.pnlPercentage >= 0 ? "+" : ""}
                        {signal.pnlPercentage?.toFixed(2)}%)
                      </p>
                    </div>
                    {signal.status === "EXECUTED" && (
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Executed At</p>
                        <p className="text-sm text-white">
                          {new Date(signal.executedAt!).toLocaleTimeString()}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* AI Analysis */}
                <div className="p-4 bg-[#0F1015] rounded-lg border border-gray-800">
                  <p className="text-xs text-gray-400 mb-2">AI Analysis</p>
                  <p className="text-sm text-gray-300">{signal.aiAnalysis}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="strategies" className="space-y-4">
          {strategies.map((strategy) => (
            <Card key={strategy.id} className="bg-[#1A1B23] border-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">
                      {strategy.name}
                    </CardTitle>
                    <p className="text-sm text-gray-400 mt-1">
                      Risk: {strategy.riskLevel} • Min Confidence:{" "}
                      {strategy.minConfidence}% • Max Position: $
                      {strategy.maxPositionSize}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge
                      className={
                        strategy.enabled
                          ? "text-green-400 bg-green-400/10"
                          : "text-gray-400 bg-gray-400/10"
                      }
                    >
                      {strategy.enabled ? "Active" : "Inactive"}
                    </Badge>
                    <Switch
                      checked={strategy.enabled}
                      onCheckedChange={() => toggleStrategy(strategy.id)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-2">
                      Supported Symbols
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {strategy.symbols.map((symbol) => (
                        <Badge
                          key={symbol}
                          variant="outline"
                          className="text-xs"
                        >
                          {symbol}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-2">Timeframes</p>
                    <div className="flex flex-wrap gap-1">
                      {strategy.timeframes.map((tf) => (
                        <Badge key={tf} variant="outline" className="text-xs">
                          {tf}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {completedSignals.map((signal) => (
            <Card key={signal.id} className="bg-[#1A1B23] border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {signal.type === "BUY" ? (
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                    <div>
                      <p className="font-medium text-white">{signal.symbol}</p>
                      <p className="text-xs text-gray-400">{signal.strategy}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-medium ${(signal.pnl || 0) >= 0 ? "text-green-400" : "text-red-400"}`}
                    >
                      {(signal.pnl || 0) >= 0 ? "+" : ""}$
                      {(signal.pnl || 0).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(signal.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
