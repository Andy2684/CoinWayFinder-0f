"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Bot,
  DollarSign,
  Activity,
  Zap,
} from "lucide-react";

export function BotsOverview() {
  const stats = [
    {
      title: "Active Bots",
      value: "12",
      change: "+3",
      changeType: "positive" as const,
      icon: Bot,
      description: "Currently running",
    },
    {
      title: "Total Profit",
      value: "$2,847.32",
      change: "+12.4%",
      changeType: "positive" as const,
      icon: DollarSign,
      description: "Last 30 days",
    },
    {
      title: "Win Rate",
      value: "73.2%",
      change: "+2.1%",
      changeType: "positive" as const,
      icon: TrendingUp,
      description: "Success rate",
    },
    {
      title: "Total Trades",
      value: "1,247",
      change: "+89",
      changeType: "positive" as const,
      icon: Activity,
      description: "This month",
    },
    {
      title: "Best Performer",
      value: "DCA Pro",
      change: "+24.7%",
      changeType: "positive" as const,
      icon: Zap,
      description: "BTC/USDT pair",
    },
    {
      title: "Risk Level",
      value: "Medium",
      change: "Stable",
      changeType: "neutral" as const,
      icon: TrendingDown,
      description: "Portfolio risk",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-[#30D5C8]/10 rounded-lg flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-[#30D5C8]" />
              </div>
              <Badge
                variant="outline"
                className={`text-xs ${
                  stat.changeType === "positive"
                    ? "border-green-500/20 text-green-400"
                    : stat.changeType === "negative"
                      ? "border-red-500/20 text-red-400"
                      : "border-gray-500/20 text-gray-400"
                }`}
              >
                {stat.change}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-gray-400">{stat.title}</p>
              <p className="text-xs text-gray-500">{stat.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
