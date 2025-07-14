// app/api/signals/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Загрузите параметры (например, userId) из запроса, если нужно:
    // const { searchParams } = new URL(request.url);
    // const userId = searchParams.get("userId");

    // Заглушка данных сигналов
    const userSignals = [
      {
        id: "sig-1",
        strategy: "scalping",
        confidence: 0.85,
        createdAt: new Date().toISOString(),
        description: "Signal A description",
      },
      {
        id: "sig-2",
        strategy: "dca",
        confidence: 0.60,
        createdAt: new Date().toISOString(),
        description: "Signal B description",
      },
    ];

    return NextResponse.json({ success: true, signals: userSignals });
  } catch (error) {
    console.error("Signals route error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load signals" },
      { status: 500 }
    );
  }
}
