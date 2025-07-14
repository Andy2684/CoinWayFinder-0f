// app/api/bots/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Заглушка списка ботов пользователя
    const userBots = [
      {
        id: "bot-1",
        name: "DCA Bot",
        strategy: "dca",
        status: "running",
        createdAt: new Date().toISOString(),
      },
      {
        id: "bot-2",
        name: "Scalper",
        strategy: "scalping",
        status: "stopped",
        createdAt: new Date().toISOString(),
      },
    ];

    return NextResponse.json({ success: true, bots: userBots });
  } catch (error) {
    console.error("Bots route error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load bots" },
      { status: 500 }
    );
  }
}
