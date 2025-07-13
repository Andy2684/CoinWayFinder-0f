import { NextRequest, NextResponse } from "next/server";

// Обязательно укажи это, чтобы отключить попытку статической генерации
export const dynamic = "force-dynamic";

const mockPerformanceData = {
  "7d": {
    totalPnL: 830,
    winRate: 71,
    avgReturn: 8.4,
    bestStreak: 12,
    maxDrawdown: -8.5,
    sharpeRatio: 1.62,
    profitFactor: 1.47,
    riskRewardRatio: 2.1,
    strategies: [
      {
        strategy: "Breakout Scalping",
        signals: 28,
        winRate: 68,
        avgReturn: 15.2,
        totalPnL: 426,
      },
      {
        strategy: "Grid Trading",
        signals: 25,
        winRate: 72,
        avgReturn: 6.8,
        totalPnL: 170,
      },
      {
        strategy: "DCA Accumulation",
        signals: 18,
        winRate: 89,
        avgReturn: 4.5,
        totalPnL: 81,
      },
    ],
    riskDistribution: [
      { name: "Low Risk", value: 45, color: "#10B981" },
      { name: "Medium Risk", value: 35, color: "#F59E0B" },
      { name: "High Risk", value: 20, color: "#EF4444" },
    ],
  },
  "30d": {
    totalPnL: 4250,
    winRate: 74,
    avgReturn: 9.2,
    bestStreak: 18,
    maxDrawdown: -12.3,
    sharpeRatio: 2.18,
    profitFactor: 1.92,
    riskRewardRatio: 2.6,
  },
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get("timeframe") || "7d";

    const performanceData =
      mockPerformanceData[timeframe as keyof typeof mockPerformanceData];

    if (!performanceData) {
      return NextResponse.json({ error: "Invalid timeframe" }, { status: 400 });
    }

    return NextResponse.json(performanceData);
  } catch (error) {
    console.error("Error fetching signal performance:", error);
    return NextResponse.json(
      { error: "Failed to fetch performance data" },
      { status: 500 },
    );
  }
}
