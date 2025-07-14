// app/api/analytics/user/[userId]/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Извлекаем последний сегмент пути как userId
    const segments = request.nextUrl.pathname.split("/");
    const userId = segments[segments.length - 1] || "unknown";

    // Заглушка аналитики для пользователя
    const analytics = {
      userId,
      signalCount: 0,
      avgConfidence: 0,
      botStats: [],
    };

    return NextResponse.json({ success: true, analytics });
  } catch (error) {
    console.error("User analytics error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load user analytics" },
      { status: 500 }
    );
  }
}
