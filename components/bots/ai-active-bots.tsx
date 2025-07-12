"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Bot,
  Brain,
  Play,
  Pause,
  Settings,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { aiBotStrategies } from "@/lib/ai-bot-strategies";

interface AIBot {
  id: string;
  name: string;
  strategy: string;
  status: "active" | "paused" | "stopped";
  investment: number;
  currentValue: number;
  pnl: number;
  pnlPercentage: number;
  aiOptimization: boolean;
  trades: number;
  successRate: number;
  lastTrade: string;
}

export function AIActiveBots() {
  const [bots, setBots] = useState<AIBot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching AI bots data
    const mockBots: AIBot[] = [
      {
        id: "ai-bot-1",
        name: "BTC Scalper Pro",
        strategy: "ai-scalping-pro",
        status: "active",
        investment: 5000,
        currentValue: 5847,
        pnl: 847,
        pnlPercentage: 16.94,
        aiOptimization: true,
        trades: 342,
        successRate: 78,
        lastTrade: "2 minutes ago",
      },
      {
        id: "ai-bot-2",
        name: "ETH DCA Smart",
        strategy: "ai-dca-plus",
        status: "active",
        investment: 2000,
        currentValue: 2156,
        pnl: 156,
        pnlPercentage: 7.8,
        aiOptimization: true,
        trades: 45,
        successRate: 84,
        lastTrade: "1 hour ago",
      },
      {
        id: "ai-bot-3",
        name: "Multi-Asset Grid",
        strategy: "ai-grid-adaptive",
        status: "paused",
        investment: 3000,
        currentValue: 3234,
        pnl: 234,
        pnlPercentage: 7.8,
        aiOptimization: true,
        trades: 128,
        successRate: 82,
        lastTrade: "3 hours ago",
      },
    ];

    setTimeout(() => {
      setBots(mockBots);
      setLoading(false);
    }, 1000);
  }, []);

  const getStrategyInfo = (strategyId: string) => {
    return aiBotStrategies.find((s) => s.id === strategyId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-400";
      case "paused":
        return "bg-yellow-500/10 text-yellow-400";
      case "stopped":
        return "bg-red-500/10 text-red-400";
      default:
        return "bg-gray-500/10 text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Play className="w-3 h-3" />;
      case "paused":
        return <Pause className="w-3 h-3" />;
      case "stopped":
        return <AlertTriangle className="w-3 h-3" />;
      default:
        return <Bot className="w-3 h-3" />;
    }
  };

  if (loading) {
    return (
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Brain className="w-5 h-5 mr-2 text-[#30D5C8]" />
            AI Active Bots
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-800 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center">
            <Brain className="w-5 h-5 mr-2 text-[#30D5C8]" />
            AI Active Bots
          </div>
          <Badge
            variant="outline"
            className="border-[#30D5C8]/30 text-[#30D5C8]"
          >
            {bots.filter((bot) => bot.status === "active").length} Active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bots.map((bot) => {
            const strategy = getStrategyInfo(bot.strategy);
            return (
              <div
                key={bot.id}
                className="p-4 rounded-lg border border-gray-800 bg-gray-900/30 hover:bg-gray-900/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-[#30D5C8]/10 flex items-center justify-center">
                      <Brain className="w-5 h-5 text-[#30D5C8]" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold flex items-center">
                        {bot.name}
                        {bot.aiOptimization && (
                          <Zap className="w-3 h-3 ml-1 text-[#30D5C8]" />
                        )}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {strategy?.name || bot.strategy}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(bot.status)}>
                      {getStatusIcon(bot.status)}
                      <span className="ml-1 capitalize">{bot.status}</span>
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-400">Investment</p>
                    <p className="text-sm font-semibold text-white">
                      ${bot.investment.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Current Value</p>
                    <p className="text-sm font-semibold text-white">
                      ${bot.currentValue.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">P&L</p>
                    <p
                      className={`text-sm font-semibold ${bot.pnl >= 0 ? "text-green-400" : "text-red-400"}`}
                    >
                      {bot.pnl >= 0 ? "+" : ""}${bot.pnl.toLocaleString()} (
                      {bot.pnlPercentage.toFixed(2)}%)
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Success Rate</p>
                    <p className="text-sm font-semibold text-[#30D5C8]">
                      {bot.successRate}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-xs text-gray-400">
                    <span>{bot.trades} trades</span>
                    <span>Last: {bot.lastTrade}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
                    >
                      <Settings className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className={
                        bot.status === "active"
                          ? "border-yellow-600 text-yellow-400 hover:bg-yellow-900/20"
                          : "border-green-600 text-green-400 hover:bg-green-900/20"
                      }
                    >
                      {bot.status === "active" ? (
                        <>
                          <Pause className="w-3 h-3 mr-1" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 mr-1" />
                          Resume
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {bot.status === "active" && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>AI Optimization Active</span>
                      <span>{Math.floor(Math.random() * 100)}% efficiency</span>
                    </div>
                    <Progress
                      value={Math.floor(Math.random() * 100)}
                      className="h-1"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {bots.length === 0 && (
          <div className="text-center py-8">
            <Brain className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No AI bots created yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Create your first AI-powered trading bot to get started
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
