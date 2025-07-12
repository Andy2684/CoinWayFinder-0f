"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Play,
  Pause,
  Settings,
  BarChart3,
  TrendingUp,
  Target,
} from "lucide-react";

interface StrategyTest {
  id: string;
  name: string;
  status: "RUNNING" | "PAUSED" | "COMPLETED" | "FAILED";
  progress: number;
  startTime: string;
  endTime?: string;
  initialBalance: number;
  currentBalance: number;
  totalTrades: number;
  winRate: number;
  maxDrawdown: number;
  sharpeRatio: number;
  parameters: Record<string, any>;
}

export function StrategyTester() {
  const [tests, setTests] = useState<StrategyTest[]>([
    {
      id: "test_1",
      name: "RSI Divergence Optimization",
      status: "RUNNING",
      progress: 65,
      startTime: "2024-01-15T10:00:00Z",
      initialBalance: 10000,
      currentBalance: 11250,
      totalTrades: 28,
      winRate: 75.5,
      maxDrawdown: -5.2,
      sharpeRatio: 2.1,
      parameters: {
        rsiPeriod: 14,
        divergenceLookback: 20,
        minConfidence: 75,
      },
    },
    {
      id: "test_2",
      name: "MACD Multi-Timeframe",
      status: "COMPLETED",
      progress: 100,
      startTime: "2024-01-14T08:00:00Z",
      endTime: "2024-01-15T08:00:00Z",
      initialBalance: 10000,
      currentBalance: 10850,
      totalTrades: 42,
      winRate: 68.2,
      maxDrawdown: -8.1,
      sharpeRatio: 1.8,
      parameters: {
        fastPeriod: 12,
        slowPeriod: 26,
        signalPeriod: 9,
        timeframes: ["1h", "4h"],
      },
    },
  ]);

  const [newTest, setNewTest] = useState({
    name: "",
    strategy: "",
    initialBalance: 10000,
    duration: "7d",
    symbols: ["BTC/USDT"],
  });

  const startNewTest = () => {
    const test: StrategyTest = {
      id: `test_${Date.now()}`,
      name: newTest.name || "Untitled Test",
      status: "RUNNING",
      progress: 0,
      startTime: new Date().toISOString(),
      initialBalance: newTest.initialBalance,
      currentBalance: newTest.initialBalance,
      totalTrades: 0,
      winRate: 0,
      maxDrawdown: 0,
      sharpeRatio: 0,
      parameters: {
        strategy: newTest.strategy,
        duration: newTest.duration,
        symbols: newTest.symbols,
      },
    };

    setTests((prev) => [test, ...prev]);

    // Reset form
    setNewTest({
      name: "",
      strategy: "",
      initialBalance: 10000,
      duration: "7d",
      symbols: ["BTC/USDT"],
    });
  };

  const toggleTest = (testId: string) => {
    setTests((prev) =>
      prev.map((test) =>
        test.id === testId
          ? {
              ...test,
              status: test.status === "RUNNING" ? "PAUSED" : "RUNNING",
            }
          : test,
      ),
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "RUNNING":
        return "text-blue-400 bg-blue-400/10";
      case "PAUSED":
        return "text-yellow-400 bg-yellow-400/10";
      case "COMPLETED":
        return "text-green-400 bg-green-400/10";
      case "FAILED":
        return "text-red-400 bg-red-400/10";
      default:
        return "text-gray-400 bg-gray-400/10";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            🧪 Strategy Tester
          </h2>
          <p className="text-gray-300">
            Backtest and optimize trading strategies
          </p>
        </div>
        <Button className="bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-[#191A1E]">
          <Settings className="w-4 h-4 mr-2" />
          Advanced Settings
        </Button>
      </div>

      <Tabs defaultValue="tests" className="space-y-6">
        <TabsList className="bg-[#1A1B23] border-gray-800">
          <TabsTrigger value="tests">
            Running Tests ({tests.length})
          </TabsTrigger>
          <TabsTrigger value="new">New Test</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="tests" className="space-y-4">
          {tests.map((test) => (
            <Card key={test.id} className="bg-[#1A1B23] border-gray-800">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">{test.name}</CardTitle>
                    <p className="text-sm text-gray-400 mt-1">
                      Started: {new Date(test.startTime).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(test.status)}>
                      {test.status}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleTest(test.id)}
                      disabled={
                        test.status === "COMPLETED" || test.status === "FAILED"
                      }
                    >
                      {test.status === "RUNNING" ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {test.status === "RUNNING" && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-white">{test.progress}%</span>
                    </div>
                    <Progress value={test.progress} className="h-2" />
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">
                      Current Balance
                    </p>
                    <p className="text-sm font-medium text-white">
                      ${test.currentBalance.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Total Return</p>
                    <p
                      className={`text-sm font-medium ${
                        test.currentBalance >= test.initialBalance
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {(
                        ((test.currentBalance - test.initialBalance) /
                          test.initialBalance) *
                        100
                      ).toFixed(2)}
                      %
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Win Rate</p>
                    <p className="text-sm font-medium text-white">
                      {test.winRate.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Sharpe Ratio</p>
                    <p className="text-sm font-medium text-white">
                      {test.sharpeRatio.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-[#0F1015] rounded-lg">
                  <p className="text-xs text-gray-400 mb-2">Parameters</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(test.parameters).map(([key, value]) => (
                      <Badge key={key} variant="outline" className="text-xs">
                        {key}:{" "}
                        {Array.isArray(value)
                          ? value.join(", ")
                          : String(value)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="new" className="space-y-6">
          <Card className="bg-[#1A1B23] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">
                Create New Strategy Test
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="testName" className="text-white">
                    Test Name
                  </Label>
                  <Input
                    id="testName"
                    value={newTest.name}
                    onChange={(e) =>
                      setNewTest((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Enter test name"
                    className="bg-[#0F1015] border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="strategy" className="text-white">
                    Strategy
                  </Label>
                  <Select
                    value={newTest.strategy}
                    onValueChange={(value) =>
                      setNewTest((prev) => ({ ...prev, strategy: value }))
                    }
                  >
                    <SelectTrigger className="bg-[#0F1015] border-gray-700 text-white">
                      <SelectValue placeholder="Select strategy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rsi-divergence">
                        RSI Divergence
                      </SelectItem>
                      <SelectItem value="macd-crossover">
                        MACD Crossover
                      </SelectItem>
                      <SelectItem value="bollinger-squeeze">
                        Bollinger Squeeze
                      </SelectItem>
                      <SelectItem value="ai-pattern">
                        AI Pattern Recognition
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="initialBalance" className="text-white">
                    Initial Balance
                  </Label>
                  <Input
                    id="initialBalance"
                    type="number"
                    value={newTest.initialBalance}
                    onChange={(e) =>
                      setNewTest((prev) => ({
                        ...prev,
                        initialBalance: Number(e.target.value),
                      }))
                    }
                    className="bg-[#0F1015] border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="duration" className="text-white">
                    Test Duration
                  </Label>
                  <Select
                    value={newTest.duration}
                    onValueChange={(value) =>
                      setNewTest((prev) => ({ ...prev, duration: value }))
                    }
                  >
                    <SelectTrigger className="bg-[#0F1015] border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1d">1 Day</SelectItem>
                      <SelectItem value="7d">7 Days</SelectItem>
                      <SelectItem value="30d">30 Days</SelectItem>
                      <SelectItem value="90d">90 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={startNewTest}
                disabled={!newTest.name || !newTest.strategy}
                className="w-full bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-[#191A1E]"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Strategy Test
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-[#1A1B23] border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Completed Tests</p>
                    <p className="text-2xl font-bold text-white">
                      {tests.filter((t) => t.status === "COMPLETED").length}
                    </p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-[#30D5C8]" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1A1B23] border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Best Performance</p>
                    <p className="text-2xl font-bold text-green-400">+25.8%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1A1B23] border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Avg Win Rate</p>
                    <p className="text-2xl font-bold text-white">71.8%</p>
                  </div>
                  <Target className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-[#1A1B23] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">
                Strategy Performance Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    name: "RSI Divergence",
                    tests: 5,
                    avgReturn: 18.5,
                    winRate: 75.2,
                    sharpe: 2.1,
                  },
                  {
                    name: "MACD Crossover",
                    tests: 3,
                    avgReturn: 12.3,
                    winRate: 68.1,
                    sharpe: 1.8,
                  },
                  {
                    name: "Bollinger Squeeze",
                    tests: 4,
                    avgReturn: 15.7,
                    winRate: 62.5,
                    sharpe: 1.6,
                  },
                  {
                    name: "AI Pattern",
                    tests: 2,
                    avgReturn: 22.1,
                    winRate: 80.0,
                    sharpe: 2.3,
                  },
                ].map((strategy) => (
                  <div
                    key={strategy.name}
                    className="p-4 bg-[#0F1015] rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-white">
                        {strategy.name}
                      </h4>
                      <Badge className="text-[#30D5C8] bg-[#30D5C8]/10">
                        {strategy.tests} tests
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-400">Avg Return</p>
                        <p className="text-sm font-medium text-green-400">
                          +{strategy.avgReturn}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Win Rate</p>
                        <p className="text-sm font-medium text-white">
                          {strategy.winRate}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Sharpe Ratio</p>
                        <p className="text-sm font-medium text-white">
                          {strategy.sharpe}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
